import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getMessages, sendMessage, markAsRead, markAllAsRead, subscribeToMessages } from '../lib/chat';
import type { ChatMessage } from '../types/database';

type ExtendedChatMessage = ChatMessage & {
  first_name: string | null;
  last_name: string | null;
  email: string;
};

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(user.id);
        setMessages(data);
        // Marquer tous les messages de l'admin comme lus quand on ouvre le chat
        if (isOpen) {
          await markAllAsRead(user.id);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Impossible de charger les messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Souscrire aux nouveaux messages
    const unsubscribe = subscribeToMessages(user.id, false, (newMessage) => {
      setMessages(prev => {
        // Éviter les doublons
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      // Marquer automatiquement comme lu si le chat est ouvert
      if (isOpen && newMessage.is_admin_message) {
        markAsRead(newMessage.id);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, isOpen]);

  // Marquer les messages comme lus quand on ouvre le chat
  useEffect(() => {
    if (isOpen && user) {
      markAllAsRead(user.id);
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const message = await sendMessage(user.id, newMessage.trim());
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
      : 'Vous';
  };

  const getReadStatus = (message: ExtendedChatMessage) => {
    if (!message.is_admin_message) {
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

  const unreadCount = messages.filter(m => !m.read && m.is_admin_message).length;

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-96 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Support</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">
                Aucun message. Commencez la conversation !
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_admin_message ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.is_admin_message
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-blue-600 text-white'
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
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
