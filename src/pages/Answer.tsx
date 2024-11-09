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
import { useToast } from "@/components/ui/use-toast";

interface Question {
  id: string;
  content: string;
  status: string;
  created_at: string;
}

const Answer = () => {
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
        setUser(user);
      }
    });
  }, [navigate, toast]);

  // Fetch questions for the current user
  const { data: questions } = useQuery({
    queryKey: ['questions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        toast({
          title: "Error fetching answers",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Question[] || [];
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
          {questions && questions.length > 0 ? (
            questions.map((question, index) => (
              <DropdownMenuItem
                key={question.id}
                onClick={() => setSelectedAnswer(question.status)}
              >
                {`The ${getOrdinalNumber(index)} answer`}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No answers available</DropdownMenuItem>
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

export default Answer;