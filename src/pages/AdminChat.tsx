import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, AlertCircle, Loader, Search, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getMessages, sendMessage, markAsRead, subscribeToMessages } from '../lib/chat';
import { supabase } from '../lib/supabase';
import type { ChatMessage } from '../types/database';

type ExtendedChatMessage = ChatMessage & {
  first_name: string | null;
  last_name: string | null;
  email: string;
};

type ChatUser = {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  unread_count: number;
  last_message_content: string | null;
  last_message_time: string | null;
  last_message_is_admin: boolean;
};

export function AdminChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.email === 'cynemos@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    // Charger la liste des utilisateurs avec des messages
    const loadChatUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_users_with_messages')
          .select('*')
          .order('last_message_time', { ascending: false, nullsLast: true });

        if (error) throw error;
        setChatUsers(data || []);

        // Sélectionner automatiquement le premier utilisateur s'il y en a
        if (data && data.length > 0 && !selectedUser) {
          setSelectedUser(data[0].user_id);
        }
      } catch (err) {
        console.error('Error loading chat users:', err);
        setError('Impossible de charger la liste des utilisateurs');
      }
    };

    loadChatUsers();

    // Souscrire aux changements des messages
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        loadChatUsers
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, navigate, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await getMessages(selectedUser, true);
        setMessages(data);
        
        // Marquer les messages non-admin comme lus
        data.forEach(message => {
          if (!message.is_admin_message && !message.read) {
            markAsRead(message.id);
          }
        });
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Impossible de charger les messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Souscrire aux nouveaux messages
    const unsubscribe = subscribeToMessages(selectedUser, true, (newMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const message = await sendMessage(selectedUser, newMessage.trim(), true);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const getAuthorName = (message: ExtendedChatMessage) => {
    if (message.is_admin_message) {
      return 'Support';
    }
    return message.first_name && message.last_name
      ? `${message.first_name} ${message.last_name}`
      : message.email;
  };

  const getReadStatus = (message: ExtendedChatMessage) => {
    if (message.is_admin_message) {
      return (
        <span className="ml-1 inline-flex text-gray-400">
          {message.read ? (
            <CheckCheck className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </span>
      );
    }
    return null;
  };

  const filteredUsers = chatUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.first_name?.toLowerCase() || '').includes(searchLower) ||
      (user.last_name?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-lg shadow-sm border min-h-[600px]">
        <div className="grid grid-cols-12 h-[600px]">
          {/* Liste des utilisateurs */}
          <div className="col-span-4 border-r">
            <div className="p-4 border-b">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(600px-73px)]">
              {filteredUsers.map((chatUser) => (
                <button
                  key={chatUser.user_id}
                  onClick={() => setSelectedUser(chatUser.user_id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 focus:outline-none ${
                    selectedUser === chatUser.user_id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {chatUser.first_name && chatUser.last_name
                          ? `${chatUser.first_name} ${chatUser.last_name}`
                          : chatUser.email}
                      </h3>
                      {chatUser.last_message_content && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {chatUser.last_message_is_admin ? 'Vous : ' : ''}
                          {chatUser.last_message_content}
                        </p>
                      )}
                    </div>
                    {chatUser.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {chatUser.unread_count}
                      </span>
                    )}
                  </div>
                  {chatUser.last_message_time && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(chatUser.last_message_time).toLocaleString()}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="col-span-8 flex flex-col">
            {selectedUser ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      Aucun message dans cette conversation.
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_admin_message ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            message.is_admin_message
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-xs opacity-75 mb-1">
                            {getAuthorName(message)}
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <div className="text-xs opacity-75 mt-1 flex items-center justify-between">
                            <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                            {getReadStatus(message)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t">
                  {error && (
                    <div className="mb-2 text-sm text-red-600">{error}</div>
                  )}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Votre message..."
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-12 w-12 mb-4" />
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
