import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email } = await req.json();

    console.log('Analyzing entries for user:', { userId, email });

    // Initialize Supabase client with service role key
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

    // Get total count of user's sentences
    const { count: totalEntries, error: countError } = await supabaseAdmin
      .from('sentences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting entries:', countError);
      throw new Error('Failed to count entries');
    }

    console.log('Total entries found:', totalEntries);

    // Check if we've reached a multiple of 5
    if (totalEntries && totalEntries % 5 === 0) {
      console.log('Multiple of 5 entries reached, fetching last 5 entries');

      // Fetch the last 5 entries
      const { data: lastEntries, error: entriesError } = await supabaseAdmin
        .from('sentences')
        .select('content, daily_sentence, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (entriesError) {
        console.error('Error fetching entries:', entriesError);
        throw new Error('Failed to fetch entries');
      }

      // Prepare entries for analysis
      const entriesForAnalysis = lastEntries
        .map(entry => `Entry: ${entry.content}\nPrompt: ${entry.daily_sentence}\nDate: ${entry.created_at}`)
        .join('\n\n');

      console.log('Sending request to OpenAI API');

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
                content: 'You are an insightful journal analyst. Analyze these 5 journal entries to identify patterns, emotional themes, and personal growth. Provide constructive observations and suggestions. Be empathetic and focus on helping the writer understand their journey.'
              },
              {
                role: 'user',
                content: `Please analyze these 5 journal entries:\n\n${entriesForAnalysis}`
              }
            ],
          }),
        });

        const responseData = await openAIResponse.json();

        if (!openAIResponse.ok) {
          console.error('OpenAI API error:', JSON.stringify(responseData, null, 2));
          
          if (responseData.error?.code === 'insufficient_quota') {
            return new Response(
              JSON.stringify({
                error: 'Analysis service temporarily unavailable due to high demand.',
                code: 'OPENAI_QUOTA_EXCEEDED'
              }),
              {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          throw new Error(`OpenAI API error: ${responseData.error?.message || 'Unknown error'}`);
        }

        const analysis = responseData.choices[0].message.content;

        console.log('Analysis generated successfully');

        // Save the analysis
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
          JSON.stringify({ success: true, message: 'Analysis generated and saved' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (openAIError: any) {
        console.error('OpenAI API or save error:', openAIError);
        
        if (openAIError.message?.includes('insufficient_quota')) {
          return new Response(
            JSON.stringify({
              error: 'Analysis service temporarily unavailable due to high demand.',
              code: 'OPENAI_QUOTA_EXCEEDED'
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
      JSON.stringify({ success: true, message: 'No analysis needed yet' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred. Please try again later.',
        code: 'UNEXPECTED_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});