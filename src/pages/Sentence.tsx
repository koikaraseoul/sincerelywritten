import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';
import JournalSubmissionForm from "@/components/journal/JournalSubmissionForm";
import CooldownMessage from "@/components/journal/CooldownMessage";

const Sentence = () => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate("/login");
        return null;
      }
      return session;
    },
  });

  // Get user's local timezone and format the date accordingly
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');

  const { data: dailySentence } = useQuery({
    queryKey: ["dailySentence", localDate],
    queryFn: async () => {
      console.log('Fetching daily sentence for local date:', localDate);
      const { data, error } = await supabase
        .from("daily_sentences")
        .select("content")
        .eq("active_date", localDate)
        .single();

      if (error) {
        console.error('Error fetching daily sentence:', error);
        throw error;
      }
      console.log('Daily sentence data:', data);
      return data?.content;
    },
  });

  // Check if user has already submitted a journal entry today
  const { data: hasSubmittedToday } = useQuery({
    queryKey: ["todayEntry", session?.user.id, localDate],
    queryFn: async () => {
      if (!session?.user.id) return false;

      const now = new Date();
      const start = startOfDay(now);
      const end = endOfDay(now);

      const { data, error } = await supabase
        .from("sentences")
        .select("id")
        .eq("user_id", session.user.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .limit(1);

      if (error) {
        console.error("Error checking today's entry:", error);
        return false;
      }

      return data && data.length > 0;
    },
    enabled: !!session?.user.id,
  });

  if (!session) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      Loading...
    </div>;
  }

  // Show cooldown message if user has already submitted today
  if (hasSubmittedToday) {
    return <CooldownMessage />;
  }

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
        </div>

        <JournalSubmissionForm
          dailySentence={dailySentence}
          userId={session.user.id}
          hasSubmittedToday={hasSubmittedToday || false}
          timezone={timezone}
        />
      </div>
    </div>
  );
};

export default Sentence;