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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { user_id } = await req.json();

    // Get the last 5 sentences from the user
    const { data: sentences, error: sentencesError } = await supabase
      .from('sentences')
      .select('id, content')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (sentencesError) throw sentencesError;
    if (!sentences || sentences.length < 5) {
      throw new Error('Not enough sentences to analyze. Please write at least 5 sentences.');
    }

    const sentenceTexts = sentences.map(s => s.content).join('\n');
    
    // Analyze texts using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in analyzing love-related themes in text. Provide a thoughtful analysis focusing on how the person views and expresses love based on their writings.'
          },
          {
            role: 'user',
            content: `Please analyze these texts and provide insights about the person's perspective on love:\n\n${sentenceTexts}`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    // Store the analysis
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        user_id,
        content: analysis,
        analyzed_sentences: sentences.map(s => s.id)
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    return new Response(JSON.stringify({ analysis: analysisData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-texts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});