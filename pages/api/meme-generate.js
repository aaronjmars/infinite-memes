import ids from "../imageGeneratorIDs.json";
import { Readable } from 'stream';

export const config = {
  maxDuration: 300, // Increased to 5 minutes
  api: {
    responseLimit: false,
  },
};

const apiToken = process.env.GLIF_API_KEY;
const apiUrl = "https://simple-api.glif.app";
const MAX_CONCURRENT_REQUESTS = 5;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { searchQuery } = req.body;

  if (!searchQuery) {
    return res.status(400).json({ error: "Search query is required" });
  }

  if (!apiToken) {
    console.error("GLIF_API_KEY is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Set up a streaming response
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Transfer-Encoding': 'chunked'
  });

  const stream = new Readable({
    read() {}
  });

  stream.pipe(res);

  const sendChunk = (data) => {
    stream.push(JSON.stringify(data) + '\n');
  };

  const generateMeme = async (id, index, retries = 0) => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          inputs: [searchQuery],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();

      if (!result || !result.output) {
        throw new Error(`Invalid response from meme generation API: ${JSON.stringify(result)}`);
      }

      sendChunk({ index, result });
      return result;
    } catch (error) {
      console.error(`Error generating meme ${index}:`, error);
      if (retries < 3) {
        await delay(RETRY_DELAY * (retries + 1));
        return generateMeme(id, index, retries + 1);
      }
      sendChunk({ index, error: error.message });
    }
  };

  const memeIds = ids.ids.slice(0, 25);
  
  for (let i = 0; i < memeIds.length; i += MAX_CONCURRENT_REQUESTS) {
    const batch = memeIds.slice(i, i + MAX_CONCURRENT_REQUESTS);
    await Promise.all(batch.map((id, batchIndex) => generateMeme(id, i + batchIndex)));
    if (i + MAX_CONCURRENT_REQUESTS < memeIds.length) {
      await delay(RETRY_DELAY);
    }
  }

  stream.push(null); // End the stream
}