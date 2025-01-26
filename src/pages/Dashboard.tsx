import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartBar, Lightbulb, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from 'date-fns-tz';
import { Textarea } from "@/components/ui/textarea";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [entryText, setEntryText] = useState('');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDate = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
      }
    });
  }, [navigate]);

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

  const handleSave = async () => {
    if (!user || !entryText.trim()) return;

    try {
      console.log('Saving practice entry...');
      const { error } = await supabase
        .from('practices')
        .insert({
          user_id: user.id,
          action_taken: entryText,
          reflection: dailySentence || '',
          email: user.email
        });

      if (error) {
        console.error('Error saving practice:', error);
        throw error;
      }

      console.log('Practice saved successfully');
      setEntryText(''); // Clear the textarea after successful save
    } catch (error) {
      console.error('Failed to save practice:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 pb-24 relative">
      {/* User Information */}
      <Card className="mb-8 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-love-500 flex items-center justify-center">
            <span className="text-xl text-white">
              {user?.email?.[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-serif">{user?.email}</h2>
            <p className="text-muted-foreground">Write sincerely to discover yourself</p>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="space-y-8 max-w-xl mx-auto">
        <div className="space-y-6">
          <p className="text-base text-foreground leading-relaxed">
            What experiences or emotions does the sentence evoke, and why? Consider how it relates to your life, values, or past, and let your thoughts flow to discover new insights.
          </p>
          
          {dailySentence && (
            <p className="text-xl italic text-love-400">
              {dailySentence}
            </p>
          )}
          
          <Textarea
            placeholder="Type here anything."
            className="min-h-[150px] text-muted-foreground"
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
          />

          <Button 
            className="w-full bg-[#000000e6] hover:bg-[#333333] text-white rounded-md transition-all duration-300 group"
            onClick={handleSave}
            disabled={!entryText.trim()}
          >
            <Mail className="mr-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            Save
          </Button>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
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
          onClick={() => navigate('/analyze')}
        >
          <Lightbulb className="h-5 w-5" />
          <span>Analysis</span>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;