import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartBar, Lightbulb, Pen } from "lucide-react";
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
          />
          
          <Button
            variant="outline"
            className="h-24 w-full flex flex-col items-center justify-center gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
            onClick={() => navigate('/sentence')}
          >
            <Pen className="h-6 w-6" />
            <span className="text-lg">Journal</span>
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