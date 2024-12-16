import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSessionCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        navigate('/login');
        return;
      }

      if (!session) {
        console.log('No active session found, redirecting to login');
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      if (!session.user?.email) {
        console.error('User email missing from session:', session);
        toast({
          title: "Authentication Error",
          description: "Please log out and sign in again.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
    };

    // Check session immediately
    checkSession();

    // Set up session monitoring
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    // Refresh session periodically (every 4 minutes)
    const refreshInterval = setInterval(async () => {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        checkSession();
      }
    }, 4 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate]);
};