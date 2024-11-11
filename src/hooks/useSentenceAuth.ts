import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatInTimeZone } from 'date-fns-tz';

export const useSentenceAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasWrittenToday, setHasWrittenToday] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to access this page",
        });
        navigate("/login");
        return;
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const today = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
      const tomorrow = formatInTimeZone(
        new Date(new Date().setDate(new Date().getDate() + 1)),
        timezone,
        'yyyy-MM-dd'
      );

      const { data: existingEntry, error } = await supabase
        .from('sentences')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .lt('created_at', tomorrow)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing entry:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check today's entry status",
        });
        return;
      }

      if (existingEntry) {
        setHasWrittenToday(true);
        toast({
          title: "Journey Continues Tomorrow",
          description: "You've poured your heart out. See you tomorrow to continue your journey.",
        });
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  return { hasWrittenToday, setHasWrittenToday };
};