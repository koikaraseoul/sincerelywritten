import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Answer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-8 left-8 hover:bg-secondary"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto pt-16">
        <Card className="p-6">
          <h1 className="text-2xl font-serif mb-8 text-center">
            Interpretation by Love Journey Tarot Deck
          </h1>
          
          <Textarea
            className="min-h-[200px] bg-secondary text-foreground resize-y"
            placeholder="Your interpretation will appear here..."
            readOnly
          />
        </Card>
      </div>
    </div>
  );
};

export default Answer;