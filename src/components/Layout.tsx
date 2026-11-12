import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth, signOut } from '../lib/auth';

const lien = ({ isActive }: { isActive: boolean }) =>
  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
  }`;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const navigate = useNavigate();
  const fermer = () => setMenuOuvert(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Déconnexion :', error);
    }
    fermer();
    navigate('/');
  };

  const liens = (
    <>
      <NavLink to="/collection" className={lien} onClick={fermer}>Collection</NavLink>
      <NavLink to="/a-propos" className={lien} onClick={fermer}>À propos</NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={lien} onClick={fermer}>
          <LayoutDashboard className="h-4 w-4 mr-1.5" />
          Gérer
        </NavLink>
      )}
      {user ? (
        <button onClick={handleSignOut} className={lien({ isActive: false })}>
          <LogOut className="h-4 w-4 mr-1.5" />
          Se déconnecter
        </button>
      ) : (
        <NavLink to="/connexion" className={lien} onClick={fermer}>
          <LogIn className="h-4 w-4 mr-1.5" />
          Connexion
        </NavLink>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm relative z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center space-x-2" onClick={fermer}>
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-1 rounded-lg transform -skew-x-12">
                <span className="text-xl font-bold tracking-tight skew-x-12 inline-block">AéroMag</span>
              </div>
              <span className="hidden sm:inline text-sm text-gray-500">Bibliothèque d'aéromodélisme</span>
            </Link>

            <div className="hidden sm:flex sm:items-center sm:space-x-1">{liens}</div>

            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMenuOuvert(!menuOuvert)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOuvert}
              >
                {menuOuvert ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {menuOuvert && <div className="sm:hidden pb-3 space-y-1">{liens}</div>}
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <a href="https://cyneprod.org/" className="hover:text-gray-700">cyneprod.org</a>
          <span className="mx-2">·</span>
          <span>v{__APP_VERSION__}</span>
        </div>
      </footer>
    </div>
  );
};
