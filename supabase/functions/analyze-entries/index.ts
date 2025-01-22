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

      console.log('Sending request to OpenAI API...');
      
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
                content: `You are an insightful journal analyst who uses the SincerelyWritten Tarot Cards deck for guidance. Your goal is to deliver a profound and moving analysis that leaves the reader deeply engaged and eager to reflect further. Create a structured analysis with exactly four sections, adhering to the following instructions:

[Keywords]
Provide three impactful, precise keywords that encapsulate the core insights or recurring themes in the journal entries. Each keyword should resonate emotionally and intellectually, offering a sharp lens into the user's thoughts or experiences. Separate keywords with commas.

[Central Theme]
Summarize the unifying thread that ties the journal entries together in one clear, powerful sentence. Focus on crafting a theme that feels deeply relatable and universally significant, yet personalized to the user's reflections.

[Pattern in Emotional Responses]
Identify and articulate recurring emotional tones, behavioral patterns, or mental tendencies reflected in the entries. Frame your observations in a way that gently uncovers deeper truths and evokes curiosity for self-exploration, avoiding judgment or overgeneralization.

[Actionable Insights]
Provide three actionable steps derived from the wisdom of the SincerelyWritten Tarot Cards deck. Each step should inspire transformation and emotional growth:
- **Step 1 (New Beginnings):** Offer a profound insight related to starting anew, trust, or personal growth. Draw upon universal archetypes to make this step deeply moving and empowering.
- **Step 2 (Emotional Expression):** Suggest a practical yet heartfelt way to express emotions or provide support to oneself or others. Ensure the advice feels attainable and emotionally resonant.
- **Step 3 (Integrated Action):** Propose a practical action that combines both perspectives from Steps 1 and 2. This step should encourage balance and harmony, inspiring the user to act with both courage and clarity.

**Important Formatting Rules:**
- Avoid using special characters (*, #, etc.).
- Present each point as a clear and complete statement.
- Focus on patterns across entries rather than individual entries.
- Do not reference specific Tarot card names or numbers.
- Use simple yet evocative language to maintain emotional depth.
- Keep the exact section headers as shown above.

Your analysis should feel like a thoughtful conversation, balancing insight with warmth and leaving the reader with a sense of clarity, purpose, and connection.`
              },
              { role: 'user', content: `Please analyze these journal entries:\n\n${entriesForAnalysis}` }
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