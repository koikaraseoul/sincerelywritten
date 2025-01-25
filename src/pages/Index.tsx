import { useNavigate } from "react-router-dom";
import { NotebookPen } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatInTimeZone } from 'date-fns-tz';

const Index = () => {
  const navigate = useNavigate();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDate = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-2xl mx-auto relative">
        <div className="text-center space-y-8 animate-fadeIn">
          <h1 className="font-open-sans text-3xl md:text-4xl lg:text-5xl font-bold text-gradient px-4">
            {dailySentence || "Loading..."}
          </h1>
          
          <button
            onClick={() => navigate("/login")}
            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden rounded-full bg-[#ea384c] hover:bg-[#d42d3f] transition-colors duration-300"
            aria-label="Join now"
          >
            <span className="relative text-white font-medium group-hover:opacity-0 transition-opacity duration-200">
              Join now
            </span>
            <NotebookPen 
              className="absolute text-white w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:animate-writing" 
              strokeWidth={2}
            />
          </button>

          <p className="text-lg text-muted-foreground max-w-md mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Begin your journey of love and reflection
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;