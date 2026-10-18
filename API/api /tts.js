// Hausa text-to-speech via Hugging Face (Meta MMS-TTS). Key stays server-side.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  const key = process.env.HF_API_KEY;
  if (!key) return res.status(503).json({ error: "HF_API_KEY is not set on the server." });

  const text = String((req.body && req.body.text) || "").trim();
  if (!text) return res.status(400).json({ error: "Please enter some Hausa text." });
  if (text.length > 500) return res.status(400).json({ error: "Text is too long (max 500 characters)." });

  const url =
    process.env.HF_TTS_URL ||
    "https://router.huggingface.co/hf-inference/models/facebook/mms-tts-hau";

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text }),
    });
    const type = r.headers.get("content-type") || "";

    if (!r.ok || type.includes("json")) {
      let d = {};
      try { d = await r.json(); } catch {}
      return res.status(r.ok ? 502 : r.status).json({
        error: d.error || `Voice provider error (${r.status}).`,
        loading: Boolean(d.estimated_time),
        estimated_time: d.estimated_time || null,
      });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", type || "audio/flac");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ error: "Could not reach the voice provider." });
  }
}
