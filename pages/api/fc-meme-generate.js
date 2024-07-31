import OpenAI from "openai";
import ids from "../imageGeneratorIDs.json";

export const config = {
  maxDuration: 60,
};

const glifApiToken = process.env.GLIF_API_KEY;
const glifApiUrl = "https://simple-api.glif.app";

const openai = new OpenAI({
  project: "proj_JPKR0G1JsA6na4uUBzjlaLJ0",
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const openaiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "I'm making a meme generator using AI. I want you to use the content of a tweet to generate a short topic of two or three words that I will use to generate the meme. It should be related to the tweet and make a great response.",
          },
          {
            role: "user",
            content: `Just give me the raw response, no quotes, nothing else. Do it for ${content}`,
          },
        ],
      });

      const memeIdea = openaiResponse.choices[0].message.content;

      const requests = ids.ids.slice(0, 15).map((id) =>
        fetch(glifApiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${glifApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            inputs: [memeIdea],
          }),
        }).then((response) => response.json())
      );

      const results = await Promise.all(requests);
      res.status(200).json(results);
    } catch (error) {
      console.error("API error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing your request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
