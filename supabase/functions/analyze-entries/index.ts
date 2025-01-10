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

    const { count: totalEntries, error: countError } = await supabaseAdmin
      .from('sentences')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting entries:', countError);
      throw new Error('Failed to count entries');
    }

    console.log('Total entries found:', totalEntries);

    if (totalEntries && totalEntries % 5 === 0) {
      console.log('Multiple of 5 entries reached, fetching last 5 entries');

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
                content: `You are an insightful journal analyst who uses the SincerelyWritten Tarot Cards deck for guidance. Create a concise analysis with exactly four sections:

                [Keywords]
                Three concise keywords summarizing the main insights or themes from the journal entries.

                [Central Theme Identified]
                A brief statement summarizing the key theme from the journal entries, without any special characters or formatting.

                [Recognized Pattern in Emotional Responses]
                A concise description of recurring emotional tones or behaviors reflected in the entries, without any special characters or formatting.

                [Actionable Insights]
                Drawing upon the wisdom of the SincerelyWritten Tarot Cards deck, provide three steps:
                Step 1: An insight about new beginnings, trust, or personal growth (drawing from Major Arcana wisdom)
                Step 2: A suggestion about emotional expression or practical support (drawing from Minor Arcana wisdom)
                Step 3: A practical action combining both perspectives

                Important formatting rules:
                - Do not use any special characters (*, #, etc.)
                - Present each point as a clear, complete statement
                - Keep your response brief and actionable
                - Focus on patterns across entries rather than individual entries
                - Do not mention any card names or numbers
                - Maintain the exact section headers as shown above
                - For Keywords section, use single words separated by commas`
              },
              {
                role: 'user',
                content: `Please analyze these journal entries:\n\n${entriesForAnalysis}`
              }
            ],
          }),
        });

        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json();
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
