import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Question = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("questions")
        .insert([
          {
            user_id: user.id,
            content: question,
          },
        ]);

      toast({
        title: "Question submitted",
        description: "Under interpreting by the Love Journey Tarot Decks, It will soon reach to you.",
      });

      setQuestion("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit question. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSubmit}
            className="hover:bg-secondary"
            disabled={!question.trim()}
          >
            <Shuffle className="h-6 w-6" />
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-serif mb-8 text-center">
          Anything to ask on relationships
        </h1>

        {/* Question Input */}
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="min-h-[200px] resize-none bg-background border-input"
        />
      </div>
    </div>
  );
};

export default Question;