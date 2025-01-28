import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getLatestAnalysisDate(supabaseAdmin: any, userId: string) {
  console.log('Fetching latest analysis date for user:', userId);
  
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching latest analysis:', error);
    throw new Error('Failed to fetch latest analysis');
  }

  const latestDate = data?.[0]?.created_at;
  console.log('Latest analysis date:', latestDate || 'No previous analysis found');
  return latestDate;
}

async function getNewEntriesCount(supabaseAdmin: any, userId: string, lastAnalysisDate: string | null) {
  console.log('Counting new entries since:', lastAnalysisDate || 'beginning');
  
  const query = supabaseAdmin
    .from('sentences')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (lastAnalysisDate) {
    query.gt('created_at', lastAnalysisDate);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting entries:', error);
    throw new Error('Failed to count entries');
  }

  console.log('New entries count:', count);
  return count || 0;
}

async function getEntriesForAnalysis(supabaseAdmin: any, userId: string, lastAnalysisDate: string | null) {
  console.log('Fetching entries for analysis since:', lastAnalysisDate || 'beginning');
  
  const query = supabaseAdmin
    .from('sentences')
    .select('content, daily_sentence, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (lastAnalysisDate) {
    query.gt('created_at', lastAnalysisDate);
  }

  query.limit(3);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching entries:', error);
    throw new Error('Failed to fetch entries');
  }

  console.log('Fetched entries count:', data?.length || 0);
  return data || [];
}

async function generateAnalysis(entries: any[]) {
  console.log('Generating analysis for entries:', entries.length);

  const formattedEntries = entries.map(entry => ({
    prompt: entry.daily_sentence,
    response: entry.content,
    date: new Date(entry.created_at).toLocaleDateString()
  }));

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
            content: `You are an insightful journal analyst. Analyze these 3 journal entries to identify:
            1. Emotional patterns and recurring themes
            2. Personal growth and self-awareness
            3. Response quality and depth of reflection
            4. Suggestions for deeper introspection
            
            Provide a clear, structured analysis that helps the user understand their journaling journey.`
          },
          {
            role: 'user',
            content: `Please analyze these journal entries, where each entry contains the prompt given and the user's response:
            ${JSON.stringify(formattedEntries, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      if (errorData.error?.code === 'insufficient_quota') {
        return { error: 'OPENAI_QUOTA_EXCEEDED' };
      }
      throw new Error('Failed to generate analysis');
    }

    const data = await response.json();
    console.log('Analysis generated successfully');
    return { analysis: data.choices[0].message.content };
  } catch (error) {
    console.error('Error generating analysis:', error);
    throw error;
  }
}

async function saveAnalysis(supabaseAdmin: any, analysis: string, userId: string, email: string) {
  console.log('Saving analysis for user:', userId);
  
  const { error } = await supabaseAdmin
    .from('analyses')
    .insert({
      content: analysis,
      user_id: userId,
      email: email
    });

  if (error) {
    console.error('Error saving analysis:', error);
    throw new Error('Failed to save analysis');
  }

  console.log('Analysis saved successfully');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email } = await req.json();
    console.log('Processing analysis request for user:', { userId, email });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const lastAnalysisDate = await getLatestAnalysisDate(supabaseAdmin, userId);
    const newEntriesCount = await getNewEntriesCount(supabaseAdmin, userId, lastAnalysisDate);

    if (newEntriesCount >= 3) {
      console.log('Sufficient entries found for analysis');
      const entries = await getEntriesForAnalysis(supabaseAdmin, userId, lastAnalysisDate);
      
      const { analysis, error } = await generateAnalysis(entries);
      
      if (error) {
        return new Response(
          JSON.stringify({
            status: 'error',
            code: error,
            error: 'Analysis temporarily unavailable due to high demand.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429
          }
        );
      }

      await saveAnalysis(supabaseAdmin, analysis, userId, email);

      return new Response(
        JSON.stringify({ 
          status: 'success',
          message: 'Analysis generated and saved successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Not enough new entries for analysis');
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
        message: 'An unexpected error occurred. Please try again later.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});