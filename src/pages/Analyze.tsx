import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatInTimeZone } from 'date-fns-tz';
import { useSession } from '@supabase/auth-helpers-react';

interface Analysis {
  id: string;
  content: string;
  created_at: string;
}

const Analyze = () => {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<Analysis | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const session = useSession();
  const { toast } = useToast();

  const { data: analyses, isLoading, refetch } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      if (!session?.user?.email) {
        console.error('No user email found in session:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasEmail: !!session?.user?.email,
          timestamp: new Date().toISOString()
        });
        throw new Error("User email is required");
      }

      console.log('Fetching analyses with user details:', {
        userId: session.user.id,
        userEmail: session.user.email,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("email", session.user.email)
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
          email: data[0].email,
          hasUserId: !!data[0].user_id,
          createdAt: data[0].created_at
        } : null
      });

      return data as Analysis[];
    },
    enabled: !!session?.user?.email,
  });

  const handleAnalyze = async () => {
    if (!journalEntry.trim()) {
      toast({
        title: "Error",
        description: "Please enter a journal entry to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('analyze-with-gpt', {
        body: {
          content: journalEntry,
          userId: session?.user?.id,
          email: session?.user?.email,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Success",
        description: "Your journal entry has been analyzed.",
      });

      // Clear the input and refresh the analyses list
      setJournalEntry("");
      refetch();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOrdinalText = (index: number): string => {
    const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    const position = index < ordinals.length ? ordinals[index] : `${index + 1}th`;
    return `The ${position} analysis`;
  };

  // If no session, redirect to login
  if (!session) {
    navigate("/login");
    return null;
  }

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
                <DropdownMenuItem disabled>No analyses available yet.</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-16">
          <h1 className="text-3xl font-serif mb-8 text-center">
            Analyze Your Thoughts
          </h1>

          <div className="space-y-6">
            <Textarea
              placeholder="Write your thoughts here for analysis..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="min-h-[200px]"
            />
            <Button 
              onClick={handleAnalyze} 
              className="w-full"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

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
                  ? "Select an analysis from the dropdown menu to view insights."
                  : "Write your thoughts above and click analyze to get started."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;