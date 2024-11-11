import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Practice = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/login');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-gradient text-center">
            Practice Your Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Coming soon: Practice exercises to help you implement your insights in daily life.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Practice;