import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartBar, Mail, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from 'date-fns-tz';
import { Textarea } from "@/components/ui/textarea";
import { startOfDay, endOfDay } from 'date-fns';

const DRAFT_KEY = 'journal_draft';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [entryText, setEntryText] = useState(() => {
    return localStorage.getItem(DRAFT_KEY) || '';
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDate = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
        console.log('User data:', user);
      }
    });
  }, [navigate]);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching user profile for ID:', user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      console.log('Profile data fetched:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (entryText && !hasSubmitted) {
      localStorage.setItem(DRAFT_KEY, entryText);
      console.log('Saved draft to localStorage');
    }
  }, [entryText, hasSubmitted]);

  const { data: dailySentence } = useQuery({
    queryKey: ["dailySentence", currentDate],
    queryFn: async () => {
      console.log('Fetching daily sentence for date:', currentDate);
      const { data, error } = await supabase
        .from("daily_sentences")
        .select("content")
        .eq("active_date", currentDate)
        .single();

      if (error) {
        console.error('Daily sentence fetch error:', error);
        throw error;
      }
      console.log('Daily sentence fetched successfully:', data?.content);
      return data?.content;
    },
  });

  const { data: existingEntry } = useQuery({
    queryKey: ["todayEntry", user?.id, currentDate],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const now = new Date();
      const start = startOfDay(now);
      const end = endOfDay(now);
      
      console.log('Checking for existing entry between:', start, 'and', end);
      
      const { data, error } = await supabase
        .from("sentences")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing entry:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (existingEntry) {
      setHasSubmitted(true);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [existingEntry]);

  const handleSave = async () => {
    if (!user || !entryText.trim() || !dailySentence || hasSubmitted) return;

    try {
      console.log('Saving sentence entry...');
      const { error } = await supabase
        .from('sentences')
        .insert({
          user_id: user.id,
          content: entryText,
          daily_sentence: dailySentence,
          email: user.email
        });

      if (error) {
        console.error('Error saving sentence:', error);
        throw error;
      }

      console.log('Sentence saved successfully');
      setHasSubmitted(true);
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('Failed to save sentence:', error);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background p-8 pb-24 relative">
      <Card className="mb-8 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-love-500 flex items-center justify-center">
            <span className="text-xl text-white">
              {displayName[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-serif">{displayName}</h2>
            <p className="text-muted-foreground">Write sincerely to discover yourself</p>
          </div>
        </div>
      </Card>

      <div className="space-y-8 max-w-xl mx-auto">
        {hasSubmitted ? (
          <div className="space-y-6 text-center">
            {dailySentence && (
              <p className="text-xl italic text-love-400 text-center mx-auto max-w-prose">
                {dailySentence}
              </p>
            )}
            <p className="text-lg text-muted-foreground">
              Your journal is saved; your journey continues tomorrow
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-base text-foreground leading-relaxed">
              What experiences or emotions does the sentence evoke, and why? Consider how it relates to your life, values, or past, and let your thoughts flow to discover new insights.
            </p>
            
            {dailySentence && (
              <p className="text-xl italic text-love-400 text-center mx-auto max-w-prose">
                {dailySentence}
              </p>
            )}
            
            <div className="space-y-4">
              <Textarea
                placeholder="Type here anything."
                className="min-h-[150px] text-muted-foreground"
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
              />
              
              <Button 
                className="w-full bg-[#000000e6] hover:bg-[#333333] text-white rounded-md transition-all duration-300 relative group"
                onClick={handleSave}
                disabled={!entryText.trim()}
              >
                <span className="opacity-100 transition-opacity duration-300 group-hover:opacity-0">
                  Save
                </span>
                <Mail className="absolute inset-0 m-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border px-4 flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate('/journal-review')}
        >
          <ChartBar className="h-5 w-5" />
          <span>Review</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate('/questions')}
        >
          <HelpCircle className="h-5 w-5" />
          <span>Question</span>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
