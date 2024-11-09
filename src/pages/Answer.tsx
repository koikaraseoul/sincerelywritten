import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type QuestionWithAnswer = Database['public']['Tables']['questions']['Row'] & {
  answer: string;
  index: number;
};

const AnswerPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view answers",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        console.log("User authenticated:", user.id);
        setUser(user);
      }
    });
  }, [navigate, toast]);

  // Fetch questions and their answers for the current user
  const { data: questionsWithAnswers, isLoading } = useQuery({
    queryKey: ['questions-with-answers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching questions for user:", user.id);
      
      // First get the user's questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (questionsError) {
        console.error("Questions fetch error:", questionsError);
        toast({
          title: "Error fetching questions",
          description: questionsError.message,
          variant: "destructive",
        });
        throw questionsError;
      }

      console.log("Questions fetched:", questions);

      if (!questions || questions.length === 0) {
        return [];
      }

      // Then get answers for these questions
      const questionIds = questions.map(q => q.id);
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .in('question_id', questionIds);

      if (answersError) {
        console.error("Answers fetch error:", answersError);
        toast({
          title: "Error fetching answers",
          description: answersError.message,
          variant: "destructive",
        });
        throw answersError;
      }

      console.log("Answers fetched:", answers);

      // Only include questions that have answers
      const questionsWithAnswers = questions
        .filter(question => answers?.some(answer => answer.question_id === question.id))
        .map((question, index) => ({
          ...question,
          answer: answers?.find(a => a.question_id === question.id)?.content || '',
          index: index + 1
        }));

      return questionsWithAnswers as QuestionWithAnswer[];
    },
    enabled: !!user,
  });

  const getOrdinalNumber = (index: number) => {
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    if (index < ordinals.length) {
      return ordinals[index];
    }
    return `${index + 1}th`;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Button
        variant="ghost"
        className="absolute top-8 left-8 hover:bg-secondary"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-8 right-8 hover:bg-secondary"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          {isLoading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : questionsWithAnswers && questionsWithAnswers.length > 0 ? (
            questionsWithAnswers.map((qa) => (
              <DropdownMenuItem
                key={qa.id}
                onClick={() => setSelectedAnswer(qa.answer)}
              >
                {`The ${getOrdinalNumber(qa.index - 1)} interpretation`}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No interpretations available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="max-w-2xl mx-auto pt-16">
        <Card className="p-6">
          <h1 className="text-2xl font-serif mb-8 text-center">
            Interpretation by Love Journey Tarot Deck
          </h1>
          
          <Textarea
            className="min-h-[200px] bg-secondary text-foreground resize-y"
            placeholder="Your interpretation will appear here..."
            value={selectedAnswer}
            readOnly
          />
        </Card>
      </div>
    </div>
  );
};

export default AnswerPage;