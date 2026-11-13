import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LogIn, Feather } from 'lucide-react';
import { useAuth, signOut } from '../lib/auth';

const lien = ({ isActive }: { isActive: boolean }) => `lien-menu${isActive ? ' actif' : ''}`;

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
      <NavLink to="/collection" className={lien} onClick={fermer}>Les rayonnages</NavLink>
      <NavLink to="/a-propos" className={lien} onClick={fermer}>À propos</NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={lien} onClick={fermer}>
          <Feather className="mr-1.5 h-4 w-4" />
          Registre
        </NavLink>
      )}
      {user ? (
        <button onClick={handleSignOut} className="lien-menu">
          <LogOut className="mr-1.5 h-4 w-4" />
          Se déconnecter
        </button>
      ) : (
        <NavLink to="/connexion" className={lien} onClick={fermer}>
          <LogIn className="mr-1.5 h-4 w-4" />
          Connexion
        </NavLink>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Corniche du meuble */}
      <header
        className="relative z-40 border-b border-laiton/40 shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
        style={{ background: 'linear-gradient(180deg, var(--bois-600), var(--bois-800) 70%, var(--bois-900))' }}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.5rem] items-center justify-between gap-4">
            <Link to="/" onClick={fermer} className="plaque text-lg sm:text-xl" aria-label="AéroMag, accueil de la bibliothèque">
              AéroMag
              <span className="ml-2 hidden font-texte text-base font-normal italic sm:inline">· la bibliothèque</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">{liens}</div>

            <button
              onClick={() => setMenuOuvert(!menuOuvert)}
              className="lien-menu md:hidden"
              aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOuvert}
            >
              {menuOuvert ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {menuOuvert && <div className="flex flex-col items-start gap-1 pb-4 md:hidden">{liens}</div>}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>

      <footer className="border-t border-laiton/30 bg-bois-950/70">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-base text-parchemin/70 sm:px-6 lg:px-8">
          <a href="https://cyneprod.org/" className="underline-offset-4 hover:text-laiton-clair hover:underline">cyneprod.org</a>
          <span className="mx-2 text-laiton">❦</span>
          <span>v{__APP_VERSION__}</span>
        </div>
      </footer>
    </div>
  );
};
