import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST method is allowed" });
  }

  const { headlines } = req.body;

  if (!headlines || !Array.isArray(headlines)) {
    return res
      .status(400)
      .json({ message: "Invalid input. Expected headlines array." });
  }

  const prompt = `
You are a financial news analyst. For each headline below, analyze the sentiment toward a stock portfolio. Return JSON with this structure:

[
  {
    "headline": "string",
    "sentiment": "positive" | "neutral" | "negative",
    "confidence": number (0-100),
    "reason": "short explanation"
  }
]

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}
`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4", // You can change to mistral, claude, etc. if available
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
        }),
      }
    );

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    // Try to extract JSON from model's reply
    const jsonStart = content?.indexOf("[");
    const jsonEnd = content?.lastIndexOf("]") + 1;
    const jsonString = content?.substring(jsonStart, jsonEnd) || "[]";

    const sentiment = JSON.parse(jsonString);

    res.status(200).json({ sentiment });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("OpenRouter error:", error);
      res
        .status(500)
        .json({ message: "Sentiment analysis failed", error: error.message });
    } else {
      console.error("Unknown error:", error);
      res
        .status(500)
        .json({ message: "Sentiment analysis failed", error: String(error) });
    }
  }
}
