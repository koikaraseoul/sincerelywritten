import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, PenLine, Calendar, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 p-4 space-y-4">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-6 h-6 text-love-500" />
          <span className="font-serif text-xl">Love Journey</span>
        </div>

        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <PenLine className="w-4 h-4" />
            Journal
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/calendar")}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="font-serif text-3xl font-bold">Your Journal</h1>
            <Button className="love-gradient hover:opacity-90">New Entry</Button>
          </div>

          <div className="grid gap-4">
            {entries.map((entry, index) => (
              <Card key={index} className="p-6 hover:border-love-500/50 transition-colors cursor-pointer">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xl font-semibold">{entry.title}</h3>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{entry.excerpt}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const entries = [
  {
    title: "First Steps into Self-Discovery",
    date: "Today",
    excerpt: "Today marks the beginning of my journey into understanding love and relationships better...",
  },
  {
    title: "Reflecting on Growth",
    date: "Yesterday",
    excerpt: "Looking back at the past month, I've noticed significant changes in how I approach...",
  },
  {
    title: "Learning to Love Myself",
    date: "2 days ago",
    excerpt: "Self-love has always been a challenging concept for me, but today I realized...",
  },
];

export default Dashboard;