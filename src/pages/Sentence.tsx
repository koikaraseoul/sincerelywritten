import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DailySentenceDisplay from "@/components/DailySentenceDisplay";
import SentenceHeader from "@/components/sentence/SentenceHeader";
import SentenceForm from "@/components/sentence/SentenceForm";
import { formatInTimeZone } from 'date-fns-tz';

const Sentence = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailySentence, setDailySentence] = useState("");
  const [hasWrittenToday, setHasWrittenToday] = useState(false);

  useEffect(() => {
    const fetchDailySentence = async () => {
      const localDate = formatInTimeZone(
        new Date(),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        'yyyy-MM-dd'
      );

      const { data, error } = await supabase
        .from('daily_sentences')
        .select('content')
        .eq('active_date', localDate)
        .single();

      if (error) {
        console.error('Error fetching daily sentence:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load today's sentence",
        });
        return;
      }

      if (data) {
        setDailySentence(data.content);
      }
    };

    fetchDailySentence();
  }, [toast]);

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
          description: "You've poured your heart out today. Come back tomorrow to continue your journey of reflection.",
        });
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSave = async () => {
    if (!content.trim() || hasWrittenToday) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to save your reflection",
        });
        navigate("/login");
        return;
      }

      const now = new Date();
      const localTimestamp = formatInTimeZone(
        now,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      const { error } = await supabase
        .from("sentences")
        .insert({
          content: content.trim(),
          user_id: user.id,
          daily_sentence: dailySentence,
          created_at: localTimestamp
        });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your journal is now part of your journey.",
      });

      setContent("");
      setHasWrittenToday(true);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save your reflection",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <SentenceHeader 
          onBack={() => navigate("/dashboard")}
          onSave={handleSave}
          isDisabled={!content.trim() || isLoading || hasWrittenToday}
        />
        
        <SentenceForm
          content={content}
          onChange={setContent}
          isDisabled={isLoading || hasWrittenToday}
        />
        
        <DailySentenceDisplay dailySentence={dailySentence} />
      </div>
    </div>
  );
};

export default Sentence;