import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { content, userId, email } = await req.json();
    
    console.log('Received analysis request:', {
      hasContent: !!content,
      contentLength: content?.length,
      userId,
      email,
      timestamp: new Date().toISOString()
    });

    if (!content || !userId || !email) {
      console.error('Missing required fields:', { 
        hasContent: !!content, 
        hasUserId: !!userId, 
        hasEmail: !!email 
      });
      
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes journal entries and provides insightful, empathetic feedback. Focus on patterns, emotional themes, and constructive observations. Be concise but meaningful.'
          },
          {
            role: 'user',
            content: `Please analyze this journal entry: ${content}`
          }
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to generate analysis');
    }

    const aiData = await openAIResponse.json();
    const analysis = aiData.choices[0].message.content;

    console.log('Successfully generated analysis:', {
      analysisLength: analysis.length,
      timestamp: new Date().toISOString()
    });

    // Store the analysis in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: savedAnalysis, error: dbError } = await supabase
      .from('analyses')
      .insert({
        content: analysis,
        user_id: userId,
        email: email,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save analysis');
    }

    console.log('Analysis saved successfully:', {
      id: savedAnalysis.id,
      timestamp: savedAnalysis.created_at
    });

    return new Response(
      JSON.stringify(savedAnalysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});