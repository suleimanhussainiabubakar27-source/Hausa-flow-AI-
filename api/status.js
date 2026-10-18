// Reports which providers are really configured. No secrets are returned.
export default function handler(req, res) {
  res.status(200).json({
    tts: Boolean(process.env.HF_API_KEY),
    stt: Boolean(process.env.GROQ_API_KEY),
    translate: Boolean(process.env.GEMINI_API_KEY),
    video: Boolean(process.env.VIDEO_API_KEY),
    supabase: Boolean(process.env.SUPABASE_URL),
  });
                 }
