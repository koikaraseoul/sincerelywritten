import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { content, userId, email } = await req.json()
    
    console.log('Received request to create analysis:', {
      userId,
      hasEmail: !!email,
      emailValue: email,
      contentLength: content?.length,
      timestamp: new Date().toISOString()
    })

    if (!content || !userId || !email) {
      console.error('Missing required fields:', { 
        hasContent: !!content, 
        hasUserId: !!userId, 
        hasEmail: !!email,
        emailValue: email,
        userId: userId
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: {
            content: !!content,
            userId: !!userId,
            email: !!email,
            emailValue: email
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Attempting to insert analysis with:', {
      userId,
      email,
      contentLength: content.length,
      timestamp: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        content,
        user_id: userId,
        email,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating analysis:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log('Successfully created analysis:', {
      id: data.id,
      userId: data.user_id,
      hasEmail: !!data.email,
      email: data.email,
      timestamp: data.created_at
    })

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201 
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})