import fetch from "node-fetch";

export const config = {
  maxDuration: 60,
};

const apiKey = process.env.NEYNAR_API_KEY;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const encodedUrl = encodeURIComponent(url);
      const apiUrl = `https://api.neynar.com/v2/farcaster/cast?identifier=${encodedUrl}&type=url`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonContent = await response.json();

      const extractedText = jsonContent.cast?.text || "";

      res.status(200).json({ content: extractedText });
    } catch (error) {
      console.error("Fetch content API error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the content" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
