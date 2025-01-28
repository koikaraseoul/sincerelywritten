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
    const { data: latestAnalysis } = await supabaseAdmin
      .from('analyses')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastAnalysisDate = latestAnalysis?.[0]?.created_at;
    console.log('Last analysis date:', lastAnalysisDate);

    // If there's no last analysis date, we'll count all entries
    // If there is a last analysis date, we'll only count entries after that date
    const query = supabaseAdmin
      .from('sentences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (lastAnalysisDate) {
      query.gt('created_at', lastAnalysisDate);
    }

    const { count: entriesSinceLastAnalysis, error: countError } = await query;

    if (countError) {
      console.error('Error counting entries:', countError);
      throw new Error('Failed to count entries');
    }

    console.log('Entries since last analysis:', entriesSinceLastAnalysis);

    // If no previous analysis exists or we have 3 or more new entries, generate analysis
    if (!lastAnalysisDate || (entriesSinceLastAnalysis && entriesSinceLastAnalysis >= 3)) {
      console.log('Generating analysis for new entries');

      // Fetch the last 3 entries, either all entries if no previous analysis
      // or only entries after the last analysis
      const entriesQuery = supabaseAdmin
        .from('sentences')
        .select('content, daily_sentence, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (lastAnalysisDate) {
        entriesQuery.gt('created_at', lastAnalysisDate);
      }

      const { data: lastEntries, error: entriesError } = await entriesQuery;

      if (entriesError) {
        console.error('Error fetching entries:', entriesError);
        throw new Error('Failed to fetch entries');
      }

      const entriesForAnalysis = lastEntries
        .map(entry => `Entry: ${entry.content}\nPrompt: ${entry.daily_sentence}\nDate: ${entry.created_at}`)
        .join('\n\n');

      console.log('Sending request to OpenAI API...');
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: `You are an insightful journal analyst who uses the SincerelyWritten Tarot Cards deck for guidance. Your goal is to deliver a profound and moving analysis that leaves the reader deeply engaged and eager to reflect further. Create a structured analysis with exactly four sections, adhering to the following instructions:

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
3. A practical action that integrates both inner wisdom and outer change

Present this method as a cohesive, flowing narrative that feels both profound and achievable. Focus on creating a sense of balance and harmony while encouraging the reader to take meaningful steps forward in their journey.`
              },
              { role: 'user', content: `Please analyze these journal entries:\n\n${entriesForAnalysis}` }
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API error:', JSON.stringify(errorData, null, 2));
          
          if (errorData.error?.code === 'insufficient_quota') {
            const { error: saveError } = await supabaseAdmin
              .from('analyses')
              .insert({
                content: 'PENDING_ANALYSIS_QUOTA_EXCEEDED',
                user_id: userId,
                email: email
              });

            if (saveError) {
              console.error('Error saving pending analysis:', saveError);
            }

            return new Response(
              JSON.stringify({
                status: 'pending',
                code: 'OPENAI_QUOTA_EXCEEDED',
                message: 'Analysis will be processed later due to high demand.'
              }),
              {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const analysis = data.choices[0].message.content;

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
      } catch (openAIError: any) {
        console.error('OpenAI API or save error:', openAIError);
        
        if (openAIError.message?.includes('insufficient_quota')) {
          return new Response(
            JSON.stringify({
              status: 'pending',
              code: 'OPENAI_QUOTA_EXCEEDED',
              message: 'Analysis will be processed later due to high demand.'
            }),
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
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