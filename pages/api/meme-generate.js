import ids from "../imageGeneratorIDs.json";
import { Readable } from "stream";

export const config = {
  maxDuration: 60,
  api: {
    responseLimit: false,
  },
};

const apiToken = process.env.GLIF_API_KEY;
const apiUrl = "https://simple-api.glif.app";

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
    "Content-Type": "application/octet-stream",
    "Transfer-Encoding": "chunked",
  });

  const stream = new Readable({
    read() {},
  });

  stream.pipe(res);

  const sendChunk = (data) => {
    stream.push(JSON.stringify(data) + "\n");
  };

  const requests = ids.ids.slice(0, 29).map((id, index) =>
    fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        inputs: [searchQuery],
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `API request failed with status ${response.status}: ${errorBody}`
          );
        }
        return response.json();
      })
      .then((result) => {
        console.log(`Response for meme ${index}:`, JSON.stringify(result));
        if (!result || !result.output) {
          throw new Error("Invalid response from meme generation API");
        }
        sendChunk({ index, result });
        return result;
      })
      .catch((error) => {
        console.error(`Error generating meme ${index}:`, error);
        sendChunk({ index, error: error.message });
      })
  );

  try {
    await Promise.all(requests);
  } catch (error) {
    console.error("Unexpected error during meme generation:", error);
  } finally {
    stream.push(null); // End the stream
  }
}
