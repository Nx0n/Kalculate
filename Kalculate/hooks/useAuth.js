import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn('Unable to restore the authenticated session.', error.message);
      }
      if (isMounted) {
        setSession(data?.session ?? null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}
