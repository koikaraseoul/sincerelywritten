import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email } = await req.json();
    console.log('Analyzing entries for user:', { userId, email });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the latest analysis date for this user
    const { data: latestAnalysis, error: latestAnalysisError } = await supabaseAdmin
      .from('analyses')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (latestAnalysisError) {
      console.error('Error fetching latest analysis:', latestAnalysisError);
      throw new Error('Failed to fetch latest analysis');
    }

    const lastAnalysisDate = latestAnalysis?.[0]?.created_at;
    console.log('Last analysis date:', lastAnalysisDate);

    // Count entries since the last analysis
    const query = supabaseAdmin
      .from('sentences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (lastAnalysisDate) {
      query.gt('created_at', lastAnalysisDate); // Changed from gte to gt
    }

    const { count: entriesSinceLastAnalysis, error: countError } = await query;

    if (countError) {
      console.error('Error counting entries:', countError);
      throw new Error('Failed to count entries');
    }

    console.log('Entries since last analysis:', entriesSinceLastAnalysis);

    // Generate analysis if no previous analysis exists or if there are 3 or more new entries
    if (!lastAnalysisDate || (entriesSinceLastAnalysis && entriesSinceLastAnalysis >= 3)) {
      console.log('Generating analysis for new entries');

      // Fetch the last 3 entries
      const entriesQuery = supabaseAdmin
        .from('sentences')
        .select('content, daily_sentence, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (lastAnalysisDate) {
        entriesQuery.gt('created_at', lastAnalysisDate); // Changed from gte to gt
      }

      const { data: lastEntries, error: entriesError } = await entriesQuery;

      if (entriesError) {
        console.error('Error fetching entries:', entriesError);
        throw new Error('Failed to fetch entries');
      }

      console.log('Last entries for analysis:', lastEntries);

      // Format entries for better analysis
      const entriesForAnalysis = lastEntries
        .map(entry => `Entry: ${entry.content}\nPrompt: ${entry.daily_sentence}\nDate: ${entry.created_at}`)
        .join('\n\n');

      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an insightful journal analyst who uses the SincerelyWritten Tarot Cards deck for guidance. Your goal is to deliver a profound and moving analysis that leaves the reader deeply engaged and eager to reflect further. Create a structured analysis with exactly four sections:

[Keywords]
Provide three impactful, precise keywords that encapsulate the core insights or recurring themes in the journal entries. Each keyword should resonate emotionally and intellectually, offering a sharp lens into the user's thoughts or experiences. Separate keywords with commas.

[Central Theme]
Summarize the unifying thread that ties the journal entries together in one clear, powerful sentence. Focus on crafting a theme that feels deeply relatable and universally significant, yet personalized to the user's reflections.

[Pattern in Emotional Responses]
Identify and articulate recurring emotional tones, behavioral patterns, or mental tendencies reflected in the entries. Frame your observations in a way that gently uncovers deeper truths and evokes curiosity for self-exploration, avoiding judgment or overgeneralization.

[Actionable Insights]
Provide one transformative method derived from the wisdom of the SincerelyWritten Tarot Cards deck. This method should inspire emotional growth by weaving together three essential elements:
1. A fresh perspective that opens the door to new beginnings
2. A heartfelt way to express and process emotions
3. A practical action that integrates both inner wisdom and outer change`
              },
              {
                role: 'user',
                content: `Please analyze these journal entries:\n\n${entriesForAnalysis}`
              }
            ]
          })
        });

        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json();
          console.error('OpenAI API error:', errorData);
          
          if (errorData.error?.code === 'insufficient_quota') {
            return new Response(
              JSON.stringify({
                status: 'error',
                code: 'OPENAI_QUOTA_EXCEEDED',
                error: 'Analysis temporarily unavailable due to high demand.'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
              }
            );
          }
          throw new Error('Failed to generate analysis');
        }

        const responseData = await openAIResponse.json();
        const analysis = responseData.choices[0].message.content;

        console.log('Analysis generated successfully');

        const { error: saveError } = await supabaseAdmin
          .from('analyses')
          .insert({
            content: analysis,
            user_id: userId,
            email: email
          });

        if (saveError) {
          console.error('Error saving analysis:', saveError);
          throw new Error('Failed to save analysis');
        }

        console.log('Analysis saved successfully');

        return new Response(
          JSON.stringify({ 
            status: 'success',
            message: 'Analysis generated and saved successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (openAIError) {
        console.error('OpenAI API or save error:', openAIError);
        throw openAIError;
      }
    }

    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'No analysis needed yet' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred. Please try again later.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});