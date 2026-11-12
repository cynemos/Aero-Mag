import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { signIn, useAuth } from '../lib/auth';

// Connexion réservée à la gestion de la bibliothèque : la consultation est libre,
// et il n'y a pas d'inscription.
export function Login() {
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
      setLoading(false);
    }
  };

  const champ =
    'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-center text-3xl font-extrabold text-gray-900">Connexion</h1>
      <p className="mt-2 text-center text-sm text-gray-500">Pour gérer la bibliothèque.</p>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mt-6 flex" role="alert">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 bg-white shadow rounded-lg p-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={champ}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={champ}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          <LogIn className="h-4 w-4 mr-2" />
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
