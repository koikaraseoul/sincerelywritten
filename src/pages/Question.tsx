import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

const Question = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate("/login");
        return null;
      }
      return session;
    },
  });

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      if (!session?.user.id) {
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("questions")
        .insert({
          content: question.trim(),
          user_id: session.user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Question submitted",
        description: "Under interpreting by the Love Journey Tarot Decks, It will soon reach to you.",
      });

      setQuestion("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit question. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubmit}
            className="absolute right-0"
            disabled={!question.trim() || isSubmitting}
          >
            <Wand2 className="h-6 w-6" />
          </Button>
        </div>

        <h1 className="text-3xl font-serif mb-8 text-center">
          Anything to ask on relationships
        </h1>

        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="min-h-[200px] resize-none bg-background border-input mb-8"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default Question;
