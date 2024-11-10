import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Answer {
  id: string;
  content: string;
  created_at: string;
  question_id: string;
}

const Answer = () => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);

  const { data: answers, isLoading } = useQuery({
    queryKey: ["answers"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: questions } = await supabase
        .from("questions")
        .select("id")
        .eq("user_id", user.user.id);

      if (!questions || questions.length === 0) return [];

      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .in("question_id", questions.map(q => q.id))
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Answer[];
    },
  });

  const getOrdinalText = (index: number): string => {
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    const position = index < ordinals.length ? ordinals[index] : `${index + 1}th`;
    return `The ${position} answer`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0"
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              {isLoading ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : answers && answers.length > 0 ? (
                answers.map((answer, index) => (
                  <DropdownMenuItem
                    key={answer.id}
                    onClick={() => setSelectedAnswer(answer)}
                    className="cursor-pointer"
                  >
                    {getOrdinalText(index)}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No answers found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-20">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Answers for you
          </h1>

          <div className="mt-8">
            {selectedAnswer ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-lg text-muted-foreground text-center">
                  {format(new Date(selectedAnswer.created_at), "MMMM d, yyyy")}
                </div>
                <div className="text-lg whitespace-pre-wrap bg-card p-6 rounded-lg border border-border">
                  {selectedAnswer.content}
                </div>
              </div>
            ) : (
              <div className="text-lg text-muted-foreground text-center">
                {answers && answers.length > 0
                  ? "Select an answer to view its content"
                  : "No answers available"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Answer;