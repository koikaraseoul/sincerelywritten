import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DailySentenceDisplay from "@/components/DailySentenceDisplay";

const Sentence = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailySentence, setDailySentence] = useState("");

  useEffect(() => {
    const fetchDailySentence = async () => {
      const { data, error } = await supabase
        .from('daily_sentences')
        .select('content')
        .eq('active_date', new Date().toISOString().split('T')[0])
        .single();

      if (error) {
        console.error('Error fetching daily sentence:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load today's sentence",
        });
        return;
      }

      if (data) {
        setDailySentence(data.content);
      }
    };

    fetchDailySentence();
  }, [toast]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to access this page",
        });
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to save your reflection",
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("sentences")
        .insert({
          content: content.trim(),
          user_id: user.id,
          daily_sentence: dailySentence,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your reflection has been saved",
      });

      setContent("");
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save your reflection",
      });
    } finally {
      setIsLoading(false);
    }
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="absolute right-0"
            disabled={!content.trim() || isLoading}
          >
            <Mail className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16 space-y-8">
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What personal experiences or emotions come to mind when you read this sentence, and why?"
              className="min-h-[200px] resize-y text-lg"
              disabled={isLoading}
            />
          </div>
          
          <DailySentenceDisplay dailySentence={dailySentence} />
        </div>
      </div>
    </div>
  );
};

export default Sentence;