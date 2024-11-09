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

interface Analysis {
  id: string;
  content: string;
  created_at: string;
}

const Analyze = () => {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<Analysis | null>(null);

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Analysis[];
    },
  });

  const getOrdinalText = (index: number): string => {
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    const position = index < ordinals.length ? ordinals[index] : `${index + 1}th`;
    return `The ${position} analysis`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="absolute left-0"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0"
              >
                <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] md:w-[240px]">
              {isLoading ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : analyses && analyses.length > 0 ? (
                analyses.map((analysis, index) => (
                  <DropdownMenuItem
                    key={analysis.id}
                    onClick={() => setSelectedEntry(analysis)}
                    className="cursor-pointer text-sm md:text-base"
                  >
                    {getOrdinalText(index)}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No analyses found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-16 md:mt-20">
          <h1 className="text-2xl md:text-3xl font-serif mb-6 md:mb-8 text-center">
            Analyses for you
          </h1>

          <div className="mt-6 md:mt-8">
            {selectedEntry ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-sm md:text-base text-muted-foreground text-center">
                  {format(new Date(selectedEntry.created_at), "MMMM d, yyyy")}
                </div>
                <div className="text-base md:text-lg whitespace-pre-wrap bg-card p-4 md:p-6 rounded-lg border border-border">
                  {selectedEntry.content}
                </div>
              </div>
            ) : (
              <div className="text-center text-sm md:text-base text-muted-foreground">
                {analyses && analyses.length > 0
                  ? "Select an analysis to view its content"
                  : "No analyses available"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;