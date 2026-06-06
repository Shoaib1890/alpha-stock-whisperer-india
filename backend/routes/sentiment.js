const express = require("express");
const axios = require("axios");
const router = express.Router();

const SYSTEM_PROMPT = `You are a financial sentiment analysis engine.
Given a stock market news headline, classify its likely sentiment impact on investors.
Always respond with ONLY valid JSON in this exact structure, nothing else:
{"sentiment":"positive","confidence":85,"reason":"brief explanation"}
Sentiment must be exactly one of: positive, negative, neutral (all lowercase).
Confidence must be an integer between 60 and 98.`;

router.post("/", async (req, res) => {
  const { headlines } = req.body;

  if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  console.log(`Sentiment: analyzing ${headlines.length} headline(s)`);

  try {
    const results = await Promise.all(
      headlines.map(async (headline) => {
        try {
          const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Headline: ${headline}` },
              ],
              max_tokens: 120,
              temperature: 0.2,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );

          const aiText = response.data.choices[0].message.content.trim();
          console.log(`  -> "${headline.slice(0, 50)}" => ${aiText}`);

          const jsonMatch = aiText.match(/\{[\s\S]*?\}/);
          if (!jsonMatch) throw new Error("No JSON found in response");

          const parsed = JSON.parse(jsonMatch[0]);
          return {
            headline,
            sentiment: String(parsed.sentiment || "neutral").toLowerCase(),
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 70,
            reason: parsed.reason || "",
          };
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.message;
          console.error(`  ! Failed for "${headline.slice(0, 50)}": ${msg}`);
          return { headline, sentiment: "neutral", confidence: 70, reason: "Analysis unavailable." };
        }
      })
    );

    res.json({ sentiment: results });
  } catch (error) {
    console.error("Sentiment route error:", error.message);
    res.status(500).json({ error: "Sentiment analysis failed" });
  }
});

module.exports = router;
