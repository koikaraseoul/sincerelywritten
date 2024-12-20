import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto relative space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-8 animate-fadeIn">
          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-gradient">
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

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Journal Analysis Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-love-700/20">
                  <img 
                    src="/lovable-uploads/6154627a-279a-40f8-845e-35540b01fb6a.png" 
                    alt="Journal icon" 
                    className="w-6 h-6"
                  />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-white">Personalized Journal Analysis</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Write from the heart and uncover meaningful insights on love and relationships. Receive tailored guidance that reflects your unique journey.
              </p>
            </CardContent>
          </Card>

          {/* Tarot Reading Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-love-700/20">
                  <svg className="w-6 h-6 text-love-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-white">Specialized Tarot Reading</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Find clarity and inspiration in love and relationships through our unique tarot readings. Each session fosters self-reflection and deeper emotional connection.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;