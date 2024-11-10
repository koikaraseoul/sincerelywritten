import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    // Initialize Supabase client with service role key
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's email and journals
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    if (!user.user) {
      throw new Error("User not found");
    }

    const { data: journals } = await supabase
      .from("sentences")
      .select("content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(5);

    if (!journals) {
      throw new Error("Journals not found");
    }

    // Send email to app builder
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Journal App <onboarding@resend.dev>",
        to: ["delivered@resend.dev"], // Replace with your email
        subject: `New Journal Milestone: ${user.user.email} has written 5 journals!`,
        html: `
          <h2>User Milestone Reached</h2>
          <p>User ${user.user.email} has written their first 5 journal entries!</p>
          <h3>Journal Entries:</h3>
          ${journals.map((journal, index) => `
            <div style="margin-bottom: 20px;">
              <h4>Entry ${index + 1} (${new Date(journal.created_at).toLocaleDateString()})</h4>
              <p>${journal.content}</p>
            </div>
          `).join("")}
        `,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);