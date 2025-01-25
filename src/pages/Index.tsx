import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
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
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gradient px-4">
            {dailySentence || "Loading..."}
          </h1>
          
          <button
            onClick={() => navigate("/login")}
            className="group relative w-32 h-32 transition-all duration-300 hover:scale-110 focus:outline-none"
            aria-label="Start your love journey"
          >
            <div className="absolute inset-0 love-gradient rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex items-center justify-center w-full h-full love-gradient rounded-full">
              <Heart className="w-16 h-16 text-white" />
            </div>
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