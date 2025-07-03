const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🚀 [API] /api/sentiment endpoint called");

  const { headlines } = req.body;
  console.log("📰 Headlines being sent for sentiment:", headlines);

  if (!headlines || !Array.isArray(headlines)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  console.log("🔑 API key present?", !!process.env.GROQ_API_KEY);

  try {
    const results = await Promise.all(
      headlines.map(async (headline) => {
        const prompt = `Analyze the following stock market news headline: "${headline}".
Determine its likely sentiment impact on investors.

Respond ONLY in this exact JSON format (no extra text):
{
  "headline": "${headline}",
  "sentiment": "Positive" | "Negative" | "Neutral",
  "confidence": <number between 70 and 100>,
  "reason": "short explanation"
}`;

        try {
          const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama3-70b-8192",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 100,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(
            "🌐 Full API response:",
            JSON.stringify(response.data, null, 2)
          );

          const aiText = response.data.choices[0].message.content;
          console.log("🧠 AI Raw Response:", aiText);

          let parsed = {
            headline,
            sentiment: "neutral",
            confidence: 70,
            reason: "No explanation provided.",
          };

          try {
            parsed = JSON.parse(aiText);
          } catch (e) {
            console.warn(
              "⚠ Could not parse AI JSON. Fallback to default neutral sentiment."
            );
          }

          return parsed;
        } catch (apiErr) {
          console.error(`❌ API failed for headline: ${headline}`);
          console.error(apiErr.response?.data || apiErr.message);
          return {
            headline,
            sentiment: "neutral",
            confidence: 70,
            reason: "API error fallback.",
          };
        }
      })
    );

    res.json({ sentiment: results });
  } catch (error) {
    console.error("AI sentiment API failed:", error);
    res.status(500).json({ error: "Sentiment analysis failed" });
  }
});

module.exports = router;
