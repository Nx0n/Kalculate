const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function normalizeItems(value: unknown) {
  const rawItems = (value as { items?: unknown })?.items;
  if (!Array.isArray(rawItems)) throw new Error('Gemini response does not contain items');
  return rawItems.slice(0, 10).flatMap((item) => {
    const candidate = item as Record<string, unknown>;
    const name = typeof candidate.name === 'string' ? candidate.name.trim().slice(0, 120) : '';
    const grams = Number(candidate.estimated_grams);
    const confidence = Number(candidate.confidence);
    const note = typeof candidate.note === 'string' ? candidate.note.trim().slice(0, 300) : '';
    if (!name || !Number.isFinite(grams) || grams < 0 || !Number.isFinite(confidence)) return [];
    return [{ name, estimated_grams: Math.round(grams), confidence: Math.max(0, Math.min(1, confidence)), note }];
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authHeader || !supabaseUrl || !supabaseAnonKey) return json({ error: 'Unauthorized' }, 401);
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return json({ error: 'Unauthorized' }, 401);

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL');
  if (!apiKey || !model) return json({ error: 'Function is not configured' }, 503);
  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > MAX_IMAGE_BYTES + 100_000) return json({ error: 'Image is too large' }, 413);

  try {
    const formData = await req.formData();
    const image = formData.get('image');
    if (!(image instanceof File)) return json({ error: 'An image file is required' }, 400);
    if (!ALLOWED_MIME_TYPES.has(image.type)) return json({ error: 'Unsupported image type' }, 415);
    if (!image.size || image.size > MAX_IMAGE_BYTES) return json({ error: 'Image is too large' }, 413);

    const prompt = `Analyze this single food photo. Return JSON only, with exactly this shape: {"items":[{"name":"food name suitable for database search, preferably Thai with English if useful","estimated_grams":0,"confidence":0,"note":"short description"}]}. confidence must be 0 to 1. Estimate edible grams per visible item. If the image is not food, too unclear, or contains no identifiable food, return {"items":[]}. Do not include markdown or any keys outside this schema.`;
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt },
          { inline_data: { mime_type: image.type, data: bytesToBase64(new Uint8Array(await image.arrayBuffer())) } },
        ] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: { items: { type: 'ARRAY', items: { type: 'OBJECT', properties: {
              name: { type: 'STRING' }, estimated_grams: { type: 'NUMBER' }, confidence: { type: 'NUMBER' }, note: { type: 'STRING' },
            }, required: ['name', 'estimated_grams', 'confidence', 'note'] } } },
            required: ['items'],
          },
        },
      }),
    });
    if (!geminiResponse.ok) {
      console.error('Gemini error', geminiResponse.status, await geminiResponse.text());
      return json({ error: 'Food analysis is temporarily unavailable' }, 502);
    }
    const geminiBody = await geminiResponse.json();
    const text = geminiBody?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('');
    if (!text) return json({ error: 'Gemini returned no analysis' }, 502);
    return json({ items: normalizeItems(JSON.parse(text)) });
  } catch (error) {
    console.error('analyze-food-image error', error);
    return json({ error: 'Unable to analyze image' }, 500);
  }
});
import { createClient } from 'npm:@supabase/supabase-js@2';
