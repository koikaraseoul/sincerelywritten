import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const Question = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch questions for the current user
  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get the selected question details
  const selectedQuestion = questions?.find(q => q.id === selectedQuestionId);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("questions")
        .insert({
          content: question.trim(),
          user_id: user.id,
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
            disabled={!question.trim() || isSubmitting}
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
          className="min-h-[200px] resize-none bg-background border-input mb-8"
          disabled={isSubmitting}
        />

        {/* Previous Questions Dropdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif">Previous Questions</h2>
          <Select
            value={selectedQuestionId}
            onValueChange={setSelectedQuestionId}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a question" />
            </SelectTrigger>
            <SelectContent>
              {questions?.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.content.substring(0, 50)}{q.content.length > 50 ? "..." : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Interpretation Section */}
          {selectedQuestion && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-serif">
                Interpretation by the Love Journey Tarot Deck
              </h2>
              <div className="bg-card p-6 rounded-lg border">
                {selectedQuestion.status === "pending" ? (
                  <p className="text-muted-foreground italic">
                    Your interpretation is being prepared...
                  </p>
                ) : (
                  <p className="whitespace-pre-wrap">{selectedQuestion.content}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question;