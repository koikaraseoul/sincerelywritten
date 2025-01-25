import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pen, ChartBar, Lightbulb, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

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

  const journalingItems = [
    { icon: Pen, label: "Journal", route: "/sentence" },
  ];

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

      {/* Reflection Section */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2 className="text-2xl font-serif text-gradient">Reflection</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Reflection Guide</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">1. Journal:</span> Write down your thoughts and feelings.</p>
                  <p><span className="font-medium">2. Analysis:</span> Get insights to help you understand yourself better.</p>
                  <p><span className="font-medium">3. Review:</span> Look back at your past writings by date.</p>
                  <p className="pt-2 italic text-muted-foreground">Start journaling today to let your story unfold and embark on a journey of self-discovery.</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-4 max-w-xl mx-auto">
          {journalingItems.map((item) => (
            <Button
              key={item.route}
              variant="outline"
              className="h-24 w-full flex flex-col items-center justify-center gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
              onClick={() => navigate(item.route)}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-lg">{item.label}</span>
            </Button>
          ))}
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