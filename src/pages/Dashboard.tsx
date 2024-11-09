import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pen, ChartBar, Lightbulb, HelpCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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
    { icon: Pen, label: "Write", route: "/sentence" },
    { icon: ChartBar, label: "Review", route: "/review" },
    { icon: Lightbulb, label: "Analyze", route: "/analyze" }
  ];

  const tarotItems = [
    { icon: HelpCircle, label: "Question", route: "/question" },
    { icon: AlertCircle, label: "Answer", route: "/answer" }
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:p-8">
      {/* User Information */}
      <Card className="mb-8 p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-love-500 flex items-center justify-center shrink-0">
            <span className="text-lg sm:text-xl text-white">
              {user?.email?.[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-serif truncate">{user?.email}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Welcome back!</p>
          </div>
        </div>
      </Card>

      {/* Journaling Section */}
      <div className="mb-8 max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-serif mb-4 text-gradient">Journaling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {journalingItems.map((item) => (
            <Button
              key={item.route}
              variant="outline"
              className="h-24 sm:h-32 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
              onClick={() => navigate(item.route)}
            >
              <item.icon className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-sm sm:text-base">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tarot Card Reading Section */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-serif mb-4 text-gradient">Tarot Card Reading</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {tarotItems.map((item) => (
            <Button
              key={item.route}
              variant="outline"
              className="h-24 sm:h-32 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
              onClick={() => navigate(item.route)}
            >
              <item.icon className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-sm sm:text-base">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;