import React, { useState } from "react";
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
import { formatInTimeZone } from 'date-fns-tz';

interface Analysis {
  id: string;
  content: string;
  created_at: string;
}

const Analyze = () => {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<Analysis | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      console.log('Fetching analyses...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for analyses fetch');
        throw new Error("Not authenticated");
      }

      console.log('Fetching analyses with user details:', {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .eq("email", user.email)
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Analyses fetch error:', error);
        throw error;
      }

      if (!data) {
        console.log('No analyses found for user');
        return [];
      }

      console.log('Analyses fetched successfully:', {
        count: data.length,
        firstAnalysis: data[0] ? {
          id: data[0].id,
          hasEmail: !!data[0].email,
          hasUserId: !!data[0].user_id,
          createdAt: data[0].created_at
        } : null
      });

      return data as Analysis[];
    },
  });

  const getOrdinalText = (index: number): string => {
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    const position = index < ordinals.length ? ordinals[index] : `${index + 1}th`;
    return `The ${position} analysis`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-8 pt-4">
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
              ) : analyses && analyses.length > 0 ? (
                analyses.map((analysis, index) => (
                  <DropdownMenuItem
                    key={analysis.id}
                    onClick={() => setSelectedEntry(analysis)}
                    className="cursor-pointer"
                  >
                    {getOrdinalText(index)}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>Write at least 5 journal entries to unlock your analyses.</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Analyses for you
          </h1>

          <div className="mt-8">
            {selectedEntry ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-lg text-muted-foreground text-center">
                  {formatInTimeZone(new Date(selectedEntry.created_at), timezone, "MMMM d, yyyy")}
                </div>
                <div className="text-lg whitespace-pre-wrap bg-card p-6 rounded-lg border border-border">
                  {selectedEntry.content}
                </div>
              </div>
            ) : (
              <div className="text-lg text-muted-foreground text-center">
                {analyses && analyses.length > 0
                  ? "Dive into your insights by selecting an analysis to explore."
                  : "Personalized analyses are waiting for you to discover."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;