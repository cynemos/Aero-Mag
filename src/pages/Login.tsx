import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound } from 'lucide-react';
import { signIn, useAuth } from '../lib/auth';

// Connexion réservée au bibliothécaire : la consultation est libre, et il n'y a pas d'inscription.
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

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="dorure text-center text-4xl font-extrabold">Le bureau du bibliothécaire</h1>
      <p className="mt-3 text-center italic text-parchemin/80">Pour tenir le registre des revues.</p>

      {error && (
        <div className="message-erreur mt-6" role="alert">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="parchemin mt-8 space-y-5 p-7">
        <div>
          <label htmlFor="email" className="libelle">Adresse email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="champ" />
        </div>
        <div>
          <label htmlFor="password" className="libelle">Mot de passe</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="champ" />
        </div>
        <button type="submit" disabled={loading} className="bouton-laiton w-full">
          <KeyRound className="mr-2 h-5 w-5" />
          {loading ? 'Ouverture…' : 'Ouvrir le registre'}
        </button>
      </form>
    </div>
  );
}
