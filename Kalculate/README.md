# Kalculate

## Food photo search (Gemini)

The app sends a selected JPG, PNG, or WebP image (maximum 5 MB) directly to the `analyze-food-image` Supabase Edge Function. The image is not written to Supabase Storage or retained by the application. Gemini only suggests food names and estimated grams; the user must select a database food, serving, and quantity before the existing daily-nutrition flow saves anything.

### Configure Supabase

1. Create a Gemini Developer API key in Google AI Studio for an account with Free Tier access.
2. Choose a model available to that account and configure both server-side secrets. Replace the example model with the exact available model name.

   ```sh
   supabase secrets set GEMINI_API_KEY="your-key"
   supabase secrets set GEMINI_MODEL="your-free-tier-gemini-model"
   ```

3. Log in and link the correct Supabase project, then deploy the function:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy analyze-food-image
   ```

The function requires the normal Supabase JWT verification at the Edge Function gateway; calls from the signed-in app carry the user session automatically. Do not disable JWT verification for this function.

`GEMINI_API_KEY` must remain a Supabase secret. Never add it to the React Native app, `EXPO_PUBLIC_*`, Git, or a client `.env` file. `.env.example` deliberately lists only `GEMINI_MODEL` as configuration documentation and contains no key.

For local Edge Function testing, set both values with `supabase secrets set --env-file ...` using a local, gitignored server-only secrets file, then run `supabase functions serve analyze-food-image`.
