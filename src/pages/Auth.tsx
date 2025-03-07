import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, KeyRound } from 'lucide-react';
import { signIn, signUp, resetPassword, updatePassword } from '../lib/auth';

export function Auth() {
  const [searchParams] = useSearchParams();
  const isReset = searchParams.get('reset') === 'true';
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'update'>(() => 
    isReset ? 'update' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      switch (mode) {
        case 'signup':
          if (password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
          }
          await signUp(email, password);
          setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
          setMode('signin');
          break;

        case 'signin':
          await signIn(email, password);
          navigate('/');
          break;

        case 'reset':
          await resetPassword(email);
          setSuccess('Vérifiez votre email pour les instructions de réinitialisation');
          break;

        case 'update':
          if (password !== confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
          if (password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
          }
          await updatePassword(password);
          setSuccess('Mot de passe mis à jour avec succès');
          setTimeout(() => navigate('/'), 2000);
          break;
      }
    } catch (err) {
      console.error('Erreur d\'authentification:', err);
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect');
        } else if (err.message.includes('User already registered')) {
          setError('Un compte existe déjà avec cet email');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur est survenue lors de l\'authentification');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'signin' && 'Connexion à votre compte'}
            {mode === 'signup' && 'Créer votre compte'}
            {mode === 'reset' && 'Réinitialiser votre mot de passe'}
            {mode === 'update' && 'Mettre à jour votre mot de passe'}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <KeyRound className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Adresse email"
                />
              </div>
            )}
            
            {(mode === 'signin' || mode === 'signup' || mode === 'update') && (
              <div>
                <label htmlFor="password" className="sr-only">
                  {mode === 'update' ? 'Nouveau mot de passe' : 'Mot de passe'}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                    mode === 'update' ? 'rounded-t-md' : mode === 'signin' ? 'rounded-b-md' : ''
                  } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder={mode === 'update' ? 'Nouveau mot de passe' : 'Mot de passe'}
                  minLength={6}
                />
              </div>
            )}

            {(mode === 'signup' || mode === 'update') && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirmer le {mode === 'update' ? 'nouveau ' : ''}mot de passe
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={`Confirmer le ${mode === 'update' ? 'nouveau ' : ''}mot de passe`}
                  minLength={6}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {mode === 'signup' ? (
                  <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                ) : mode === 'reset' || mode === 'update' ? (
                  <KeyRound className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                ) : (
                  <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                )}
              </span>
              {loading
                ? 'Chargement...'
                : mode === 'signin'
                ? 'Se connecter'
                : mode === 'signup'
                ? "S'inscrire"
                : mode === 'reset'
                ? 'Envoyer les instructions'
                : 'Mettre à jour le mot de passe'}
            </button>
          </div>

          {mode !== 'update' && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {mode === 'signin'
                  ? "Pas de compte ? S'inscrire"
                  : 'Déjà un compte ? Se connecter'}
              </button>
              {mode !== 'reset' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
