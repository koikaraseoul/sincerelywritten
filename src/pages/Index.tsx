import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border/50 p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-love-500" />
            <span className="font-serif text-xl">Love Journey</span>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/login")}
            className="hover:bg-love-900 transition-colors"
          >
            Start Your Journey
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="container py-24 space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold animate-fadeIn">
              Document Your
              <span className="text-gradient block">Love Journey</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A safe space to reflect on your relationships, emotions, and personal growth through thoughtful journaling.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="love-gradient hover:opacity-90 transition-opacity"
              >
                Begin Writing
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/about")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-24 border-t border-border/50">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-border/50 space-y-4 hover:border-love-500/50 transition-colors"
              >
                <feature.icon className="w-12 h-12 text-love-500" />
                <h3 className="font-serif text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Love Journey. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    title: "Private Journaling",
    description: "Your thoughts are yours alone. Write freely in a secure, private space.",
    icon: Heart,
  },
  {
    title: "Reflection Prompts",
    description: "Get inspired with thoughtful prompts to guide your journaling practice.",
    icon: Heart,
  },
  {
    title: "Track Growth",
    description: "See your emotional journey unfold through beautiful visualizations.",
    icon: Heart,
  },
];

export default Index;