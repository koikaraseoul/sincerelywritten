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
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view questions",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        setUser(user);
      }
    });
  }, [navigate, toast]);

  // Fetch questions for the current user
  const { data: questions, isError } = useQuery({
    queryKey: ['questions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching questions",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Question[] || [];
    },
    enabled: !!user,
  });

  if (isError) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="p-6">
          <h1 className="text-2xl font-serif mb-4">Error loading questions</h1>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-8 left-8 hover:bg-secondary"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Dropdown Button */}
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
            questions.map((question) => (
              <DropdownMenuItem
                key={question.id}
                onClick={() => setSelectedQuestion(question.content)}
              >
                {new Date(question.created_at).toLocaleDateString()} - Status: {question.status}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No questions available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto pt-16">
        <Card className="p-6">
          <h1 className="text-2xl font-serif mb-8 text-center">
            Interpretation by Love Journey Tarot Deck
          </h1>
          
          <Textarea
            className="min-h-[200px] bg-secondary text-foreground resize-y"
            placeholder="Your interpretation will appear here..."
            value={selectedQuestion}
            readOnly
          />
        </Card>
      </div>
    </div>
  );
};

export default Answer;