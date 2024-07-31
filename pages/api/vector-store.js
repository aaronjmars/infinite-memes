import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

let pinecone = null;
const openai = new OpenAI({
  project: "proj_JPKR0G1JsA6na4uUBzjlaLJ0",
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { query, imageUrls } = req.body;

      if (!query || !imageUrls || !Array.isArray(imageUrls)) {
        return res
          .status(400)
          .json({ error: "Query and imageUrls array are required" });
      }

      if (!pinecone) {
        pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
      }

      const index = pinecone.Index("memes-vector");

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      const vectors = imageUrls.map((imageUrl, i) => ({
        id: `${Date.now()}-${i}`,
        values: queryEmbedding,
        metadata: { query, imageUrl },
      }));

      await index.upsert(vectors);

      res.status(200).json({ message: "Vectors stored successfully" });
    } catch (error) {
      console.error("Vector store error:", error);
      res
        .status(500)
        .json({
          error: "An error occurred while storing vectors",
          details: error.message,
        });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
