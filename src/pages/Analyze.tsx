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

interface Reflection {
  id: string;
  content: string;
  reflection_date: string;
  created_at: string;
}

const Analyze = () => {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<Reflection | null>(null);

  const { data: reflections, isLoading } = useQuery({
    queryKey: ["reflections"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Reflection[];
    },
  });

  return (
    <div className="min-h-screen bg-background p-8">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-secondary flex items-center gap-2"
              >
                Select Entry <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              {isLoading ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : reflections && reflections.length > 0 ? (
                reflections.map((reflection) => (
                  <DropdownMenuItem
                    key={reflection.id}
                    onClick={() => setSelectedEntry(reflection)}
                    className="cursor-pointer"
                  >
                    {format(new Date(reflection.reflection_date), "MMMM d, yyyy")}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No entries found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="mt-8">
          {selectedEntry ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-sm text-muted-foreground">
                {format(new Date(selectedEntry.reflection_date), "MMMM d, yyyy")}
              </div>
              <div className="text-lg whitespace-pre-wrap">
                {selectedEntry.content}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Select an entry to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;