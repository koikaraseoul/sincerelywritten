import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DailySentenceDisplay from "@/components/DailySentenceDisplay";
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

      // Check if user has already written today using local timezone
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
        <div className="flex justify-between items-center mb-8 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="absolute right-0"
            disabled={!content.trim() || isLoading || hasWrittenToday}
          >
            <Mail className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Your Journals
          </h1>
          
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What personal experiences or emotions come to mind when you read this sentence, and why? Reflect on how it connects to your life, values, or experiences, and let your thoughts flow to uncover new insights or emotions."
              className="min-h-[200px] resize-y text-lg whitespace-pre-wrap"
              disabled={isLoading || hasWrittenToday}
            />
          </div>
          
          <DailySentenceDisplay dailySentence={dailySentence} />
        </div>
      </div>
    </div>
  );
};

export default Sentence;