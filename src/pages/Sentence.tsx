import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LetterText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Sentence = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const dailySentence = "Love is not about possession, it's about appreciation.";

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please login to save your response",
        });
        return;
      }

      const { error } = await supabase
        .from("sentences")
        .insert({
          content,
          user_id: user.id,
          daily_sentence: dailySentence,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your response has been saved",
      });

      setContent("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your response",
      });
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
            onClick={handleSave}
            className="absolute right-0"
            disabled={!content.trim()}
          >
            <LetterText className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-2">Today's Sentence</h2>
            <p className="text-xl italic text-love-400">{dailySentence}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-serif">Your Response</h3>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="min-h-[200px] resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentence;