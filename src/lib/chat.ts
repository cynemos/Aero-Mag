import { supabase } from './supabase';
import type { ChatMessage } from '../types/database';

export const getMessages = async (userId: string, isAdmin: boolean = false) => {
  try {
    const { data, error } = await supabase
      .rpc('get_chat_messages', { p_user_id: userId });

    if (error) throw error;
    return data as ChatMessage[];
  } catch (err) {
    console.error('Error fetching messages:', err);
    throw err;
  }
};

export const sendMessage = async (userId: string, content: string, isAdminMessage: boolean = false) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        content,
        is_admin_message: isAdminMessage,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    
    // Fetch the complete message with user info
    const messageWithUser = await getMessages(userId);
    return messageWithUser[messageWithUser.length - 1];
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
};

export const markAsRead = async (messageId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
  } catch (err) {
    console.error('Error marking message as read:', err);
    throw err;
  }
};

export const markAllAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('is_admin_message', true)
      .eq('read', false);

    if (error) throw error;
  } catch (err) {
    console.error('Error marking messages as read:', err);
    throw err;
  }
};

export const subscribeToMessages = (userId: string, isAdmin: boolean, callback: (message: ChatMessage) => void) => {
  const channel = supabase
    .channel('chat_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: isAdmin ? undefined : `user_id=eq.${userId}`
      },
      async (payload) => {
        // Fetch the complete message with user info
        const { data, error } = await supabase
          .rpc('get_chat_messages', { p_user_id: payload.new.user_id });

        if (!error && data) {
          const newMessage = data.find(msg => msg.id === payload.new.id);
          if (newMessage) {
            callback(newMessage as ChatMessage);
            
            // Marquer automatiquement comme lu si c'est un message admin et que le chat est ouvert
            if (newMessage.is_admin_message && !isAdmin) {
              await markAsRead(newMessage.id);
            }
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
