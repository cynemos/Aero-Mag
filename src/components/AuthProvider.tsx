import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthContext } from '../lib/auth';
import { supabase } from '../lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let actif = true;

    const appliquer = async (nouveau: User | null) => {
      let admin = false;
      if (nouveau) {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) console.error('Vérification du rôle impossible :', error);
        admin = data === true;
      }
      if (!actif) return;
      setUser(nouveau);
      setIsAdmin(admin);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => appliquer(session?.user ?? null));

    // setTimeout : on ne doit pas appeler la base directement dans ce rappel (blocage connu de supabase-js)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => appliquer(session?.user ?? null), 0);
    });

    return () => {
      actif = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
