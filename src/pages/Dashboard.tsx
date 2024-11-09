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
    <div className="min-h-screen bg-background px-4 py-6 sm:p-6 md:p-8 lg:p-12">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* User Information */}
        <Card className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-love-500 flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-xl md:text-2xl text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-serif truncate">{user?.email}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Welcome back!</p>
            </div>
          </div>
        </Card>

        {/* Journaling Section */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-gradient px-2">Journaling</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journalingItems.map((item) => (
              <Button
                key={item.route}
                variant="outline"
                className="h-auto py-8 sm:py-10 flex-col gap-3 hover:border-love-500 hover:text-love-500 transition-colors"
                onClick={() => navigate(item.route)}
              >
                <item.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="text-sm sm:text-base">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tarot Card Reading Section */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-gradient px-2">Tarot Card Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tarotItems.map((item) => (
              <Button
                key={item.route}
                variant="outline"
                className="h-auto py-8 sm:py-10 flex-col gap-3 hover:border-love-500 hover:text-love-500 transition-colors"
                onClick={() => navigate(item.route)}
              >
                <item.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="text-sm sm:text-base">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;