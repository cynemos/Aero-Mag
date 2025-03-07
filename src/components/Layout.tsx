import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, X, LayoutDashboard, MessageCircle } from 'lucide-react';
import { useAuth, signOut } from '../lib/auth';
import { RssFeed } from './RssFeed';
import { ChatWidget } from './ChatWidget';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

// Change to a named export
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const isAdmin = user?.email === 'cynemos@gmail.com';

  useEffect(() => {
    if (!isAdmin || !user) return;

    // Charger le nombre initial de messages non lus
    const loadUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('read', false)
          .eq('is_admin_message', false);

        if (error) throw error;
        setUnreadMessages(data?.length || 0);
      } catch (err) {
        console.error('Error loading unread messages count:', err);
      }
    };

    loadUnreadCount();

    // Souscrire aux changements des messages
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'chat_messages',
          filter: 'read=eq.false,is_admin_message=eq.false'
        },
        loadUnreadCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm relative z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">Collection AéroMag</span>
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <Link
                to="/collection"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Collection
              </Link>
              {!isAdmin && (
                <Link
                  to="/about"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  À propos
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-1" />
                    Tableau de bord
                  </Link>
                  <Link
                    to="/admin/chat"
                    className="relative inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    <MessageCircle className="h-5 w-5 mr-1" />
                    Messages
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {user && !isAdmin && (
                <>
                  <Link
                    to="/orders"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Commandes
                  </Link>
                  <Link
                    to="/cart"
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <ShoppingCart className="h-6 w-6" />
                  </Link>
                </>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <User className="h-6 w-6" />
                </button>
                {showDropdown && (
                  <>
                    {/* Overlay pour fermer le dropdown en cliquant à l'extérieur */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    {/* Menu dropdown */}
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu">
                        {user ? (
                          <>
                            <Link
                              to="/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                              onClick={() => setShowDropdown(false)}
                            >
                              Mon Profil
                            </Link>
                            <Link
                              to="/cgv"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                              onClick={() => setShowDropdown(false)}
                            >
                              CGV
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              <div className="flex items-center">
                                <LogOut className="h-4 w-4 mr-2" />
                                Se déconnecter
                              </div>
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/auth"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                              onClick={() => setShowDropdown(false)}
                            >
                              Se connecter
                            </Link>
                            <Link
                              to="/cgv"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                              onClick={() => setShowDropdown(false)}
                            >
                              CGV
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bouton menu mobile */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          <div className={`${showMobileMenu ? 'block' : 'hidden'} sm:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/collection"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                Collection
              </Link>
              {!isAdmin && (
                <Link
                  to="/about"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  À propos
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="flex items-center">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      Tableau de bord
                    </div>
                  </Link>
                  <Link
                    to="/admin/chat"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Messages
                      {unreadMessages > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {unreadMessages}
                        </span>
                      )}
                    </div>
                  </Link>
                </>
              )}
              {user && !isAdmin && (
                <>
                  <Link
                    to="/orders"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Commandes
                  </Link>
                  <Link
                    to="/cart"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Panier
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                Mon Profil
              </Link>
              <Link
                to="/cgv"
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                CGV
              </Link>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Se déconnecter
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {user && !isAdmin && <ChatWidget />}

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              ©CYNEPROD {new Date().getFullYear()} Tous droits réservés.
            </p>
            <div className="mt-2">
              <Link
                to="/cgv"
                className="text-sm text-gray-500 hover:text-gray-600"
              >
                Conditions Générales de Vente
              </Link>
            </div>
            <RssFeed />
          </div>
        </div>
      </footer>
    </div>
  );
};
