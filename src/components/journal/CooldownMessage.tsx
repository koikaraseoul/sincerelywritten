import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CooldownMessage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-8 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Your Journals
          </h1>
          
          <p className="text-love-400 text-lg italic text-center mb-8">
            Moving forward means leaving behind words that no longer serve love.
          </p>

          <div className="p-6 bg-card rounded-lg text-center text-muted-foreground">
            You've already shared your thoughts for today. Return tomorrow for a fresh reflection.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CooldownMessage;