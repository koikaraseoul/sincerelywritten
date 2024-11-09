import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pen, Mail, Sun, Lamp, Wand } from "lucide-react";
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
    { icon: Mail, label: "Review", route: "/review" },
    { icon: Sun, label: "Analyze", route: "/analyze" }
  ];

  const tarotItems = [
    { icon: Lamp, label: "Question", route: "/question" },
    { icon: Wand, label: "Answer", route: "/answer" }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
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
            <p className="text-muted-foreground">Welcome back!</p>
          </div>
        </div>
      </Card>

      {/* Journaling Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif mb-4 text-gradient">Journaling</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {journalingItems.map((item) => (
            <Button
              key={item.route}
              variant="outline"
              className="h-32 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
              onClick={() => navigate(item.route)}
            >
              <item.icon className="h-8 w-8" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tarot Card Reading Section */}
      <div>
        <h2 className="text-2xl font-serif mb-4 text-gradient">Tarot Card Reading</h2>
        <div className="grid grid-cols-2 gap-4">
          {tarotItems.map((item) => (
            <Button
              key={item.route}
              variant="outline"
              className="h-32 flex-col gap-2 hover:border-love-500 hover:text-love-500 transition-colors"
              onClick={() => navigate(item.route)}
            >
              <item.icon className="h-8 w-8" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;