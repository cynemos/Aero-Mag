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

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className="relative group"
    >
      <div className="bg-gradient-to-r from-blue-600/0 to-blue-600/0 hover:from-blue-600/5 hover:to-blue-600/5 text-gray-900 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out">
        <span className="relative font-medium text-sm">
          {children}
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 transform scale-x-0 transition-transform group-hover:scale-x-100 origin-left"></span>
        </span>
      </div>
    </Link>
  );

  const IconButton = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={`relative group bg-gradient-to-r from-blue-600/0 to-blue-600/0 hover:from-blue-600/5 hover:to-blue-600/5 p-2 rounded-lg transition-all duration-200 ease-in-out ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm relative z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-1 rounded-lg transform -skew-x-12">
                    <span className="text-xl font-bold tracking-tight skew-x-12 inline-block">
                      Collection
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-3 py-1 rounded-lg transform -skew-x-12">
                    <span className="text-xl font-bold tracking-tight skew-x-12 inline-block">
                      AéroMag
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <NavLink to="/collection">Collection</NavLink>
              {!isAdmin && <NavLink to="/about">À propos</NavLink>}
              {isAdmin && (
                <>
                  <NavLink to="/admin">
                    <div className="flex items-center">
                      <LayoutDashboard className="h-5 w-5 mr-1" />
                      Tableau de bord
                    </div>
                  </NavLink>
                  <NavLink to="/admin/chat">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-1" />
                      Messages
                      {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                          {unreadMessages}
                        </span>
                      )}
                    </div>
                  </NavLink>
                </>
              )}
              {user && !isAdmin && (
                <>
                  <NavLink to="/orders">Commandes</NavLink>
                  <IconButton>
                    <Link to="/cart">
                      <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    </Link>
                  </IconButton>
                </>
              )}
              <div className="relative">
                <IconButton onClick={() => setShowDropdown(!showDropdown)}>
                  <User className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </IconButton>
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                      <div className="py-1" role="menu">
                        {user ? (
                          <>
                            <Link
                              to="/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors"
                              role="menuitem"
                              onClick={() => setShowDropdown(false)}
                            >
                              Mon Profil
                            </Link>
                            <Link
                              to="/cgv"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors"
                              role="menuitem"
                              onClick={() => setShowDropdown(false)}
                            >
                              CGV
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors"
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
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors"
                              role="menuitem"
                              onClick={() => setShowDropdown(false)}
                            >
                              Se connecter
                            </Link>
                            <Link
                              to="/cgv"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors"
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
              <IconButton
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-700"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </IconButton>
            </div>
          </div>

          {/* Menu mobile */}
          <div className={`${showMobileMenu ? 'block' : 'hidden'} sm:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/collection"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Collection
              </Link>
              {!isAdmin && (
                <Link
                  to="/about"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  À propos
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="flex items-center">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      Tableau de bord
                    </div>
                  </Link>
                  <Link
                    to="/admin/chat"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
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
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Commandes
                  </Link>
                  <Link
                    to="/cart"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Panier
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Mon Profil
              </Link>
              <Link
                to="/cgv"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                CGV
              </Link>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
                >
                  Se déconnecter
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-colors"
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
