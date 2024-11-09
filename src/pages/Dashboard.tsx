import React from "react";
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
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* User Information */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-[2.5rem] h-[2.5rem] md:w-[3rem] md:h-[3rem] rounded-full bg-love-500 flex items-center justify-center">
              <span className="text-lg md:text-xl text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-serif truncate">{user?.email}</h2>
              <p className="text-sm md:text-base text-muted-foreground">Welcome back!</p>
            </div>
          </div>
        </Card>

        {/* Journaling Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-serif mb-3 md:mb-4 text-gradient">Journaling</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {journalingItems.map((item) => (
              <Button
                key={item.route}
                variant="outline"
                className="h-auto py-6 md:py-8 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
                onClick={() => navigate(item.route)}
              >
                <item.icon className="w-6 h-6 md:w-8 md:h-8" />
                <span className="text-sm md:text-base">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tarot Card Reading Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-serif mb-3 md:mb-4 text-gradient">Tarot Card Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {tarotItems.map((item) => (
              <Button
                key={item.route}
                variant="outline"
                className="h-auto py-6 md:py-8 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
                onClick={() => navigate(item.route)}
              >
                <item.icon className="w-6 h-6 md:w-8 md:h-8" />
                <span className="text-sm md:text-base">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;