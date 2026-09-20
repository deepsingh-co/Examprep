const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const callClaude = async (messages, jsonMode = false, maxTokens = 1500) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free",
        messages,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    }).catch((err) => {
      throw new Error(
        err.name === "AbortError"
          ? "AI request timed out. Please try again."
          : `OpenRouter API error: ${err.message}`
      );
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }

    const err = await response.text();

    if (response.status === 402) {
      const match = err.match(/can only afford (\d+)/);
      const affordable = match ? Number(match[1]) : 0;
      const nextTokens = Math.max(200, Math.floor(affordable * 0.9));
      if (attempt < 2 && nextTokens < maxTokens) {
        console.log(`[ai] credits low, retrying with max_tokens=${nextTokens}`);
        maxTokens = nextTokens;
        continue;
      }
    }

    throw new Error(`OpenRouter API error: ${err}`);
  }
  throw new Error("OpenRouter API error: request failed");
};

export const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const extractJson = (text) => {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();

  const findBalanced = (s, startIdx) => {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIdx; i < s.length; i++) {
      const ch = s[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = !inString;
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return s.slice(startIdx, i + 1);
      }
    }
    return null;
  };

  let best = null;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] !== "{") continue;
    const candidate = findBalanced(cleaned, i);
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      if (!best || candidate.length > best.length) best = { parsed, length: candidate.length };
    } catch (_) {
      // keep scanning for the next valid object
    }
  }

  if (best) return best.parsed;

  throw new Error("AI response did not contain valid JSON");
};