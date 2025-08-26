import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, filename } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'Extract procedures from Swiss FMH logbook PDF. Return JSON array with: proc_name, module_name, minimum, responsible, instructing, assistant, total (all numbers).'
        }, {
          role: 'user',
          content: `Parse this text from ${filename}:\n\n${text.slice(0, 50000)}`
        }],
        temperature: 0.1
      }),
    });

    const data = await response.json();
    const procedures = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(procedures), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});