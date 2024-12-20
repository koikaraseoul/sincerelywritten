import { useNavigate } from "react-router-dom";
import { Heart, BookHeart, Sparkles } from "lucide-react";
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
            <div className="absolute inset-0 love-gradient rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex items-center justify-center w-full h-full love-gradient rounded-full">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Journal Analysis Card */}
          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900">
                  <BookHeart className="w-6 h-6 text-pink-600 dark:text-pink-300" />
                </div>
                <h2 className="text-2xl font-serif font-semibold">Personalized Journal Analysis</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Discover meaningful insights on love and relationships. Write heartfelt journal entries to receive personalized guidance tailored to your reflections.
              </p>
            </CardContent>
          </Card>

          {/* Tarot Reading Card */}
          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h2 className="text-2xl font-serif font-semibold">Specialized Tarot Reading</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Gain heartfelt guidance on love and relationships with our unique tarot readings. Designed to inspire self-reflection and uncover deeper emotional insights, each reading helps you navigate your personal journey with clarity and connection.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;