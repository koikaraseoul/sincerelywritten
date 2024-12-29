import { useNavigate } from "react-router-dom";
import { Heart, BookOpen, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-5xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-12 animate-fadeIn">
          <h1 className="font-serif text-7xl md:text-8xl lg:text-9xl font-bold text-gradient">
            Love?
          </h1>
          
          <button
            onClick={() => navigate("/login")}
            className="group relative w-32 h-32 transition-all duration-300 hover:scale-110 focus:outline-none"
            aria-label="Start your love journey"
          >
            <div className="absolute inset-0 bg-love-700 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex items-center justify-center w-full h-full bg-love-700 rounded-full">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </button>
        </div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-black/40 border-gray-800 p-6 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-600/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-serif">Personalized Journal Analysis</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Write from the heart and uncover meaningful insights on love and relationships. Receive tailored guidance that reflects your unique journey.
            </p>
          </Card>

          <Card className="bg-black/40 border-gray-800 p-6 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <h2 className="text-2xl font-serif">Specialized Tarot Reading</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Find clarity and inspiration in love and relationships through our unique tarot readings. Each session fosters self-reflection and deeper emotional connection.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;