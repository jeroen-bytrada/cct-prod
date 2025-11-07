import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Webhook trigger requested by user: ${user.email}`)

    // Get webhook URL from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('wh_run')
      .single()

    if (settingsError || !settings?.wh_run) {
      console.error('Settings error:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Calling webhook...')

    // Validate webhook URL to prevent SSRF attacks
    const isValidWebhookUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url)
        
        // Block localhost and local IPs
        if (
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname.startsWith('169.254.') ||
          parsed.hostname.startsWith('10.') ||
          parsed.hostname.startsWith('192.168.') ||
          parsed.hostname.startsWith('172.16.') ||
          parsed.hostname.startsWith('172.17.') ||
          parsed.hostname.startsWith('172.18.') ||
          parsed.hostname.startsWith('172.19.') ||
          parsed.hostname.startsWith('172.20.') ||
          parsed.hostname.startsWith('172.21.') ||
          parsed.hostname.startsWith('172.22.') ||
          parsed.hostname.startsWith('172.23.') ||
          parsed.hostname.startsWith('172.24.') ||
          parsed.hostname.startsWith('172.25.') ||
          parsed.hostname.startsWith('172.26.') ||
          parsed.hostname.startsWith('172.27.') ||
          parsed.hostname.startsWith('172.28.') ||
          parsed.hostname.startsWith('172.29.') ||
          parsed.hostname.startsWith('172.30.') ||
          parsed.hostname.startsWith('172.31.')
        ) {
          return false
        }
        
        // Only allow HTTPS for security
        return parsed.protocol === 'https:'
      } catch {
        return false
      }
    }

    if (!isValidWebhookUrl(settings.wh_run)) {
      console.error('Invalid webhook URL:', settings.wh_run)
      return new Response(
        JSON.stringify({ error: 'Invalid webhook URL. Only HTTPS URLs to public domains are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      console.error('N8N_WEBHOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook authentication not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call the webhook with authentication header
    const webhookResponse = await fetch(settings.wh_run, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        triggered_by: user.email,
      }),
    })

    console.log(`Webhook response status: ${webhookResponse.status}`)

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Webhook error response:', errorText)
      return new Response(
        JSON.stringify({ 
          error: `Webhook returned ${webhookResponse.status}: ${webhookResponse.statusText}`,
          details: errorText
        }),
        { 
          status: webhookResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const responseData = await webhookResponse.text()
    console.log('Webhook call successful')

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in trigger-webhook function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
