import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

let pinecone = null;
const openai = new OpenAI({
  project: "proj_JPKR0G1JsA6na4uUBzjlaLJ0",
  apiKey: process.env.OPENAI_API_KEY,
});

const SIMILARITY_THRESHOLD = 0.7;
const PAGE_SIZE = 20;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {
        query,
        page = 0,
        checkOnly = false,
        isNewlyGenerated = false,
      } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (!pinecone) {
        pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
      }

      const index = pinecone.Index("vector-memes");

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });

      const queryEmbedding = embeddingResponse.data[0].embedding;

      if (checkOnly) {
        const checkResponse = await index.query({
          vector: queryEmbedding,
          topK: 1,
          includeMetadata: true,
        });

        const mostSimilarScore =
          checkResponse.matches.length > 0 ? checkResponse.matches[0].score : 0;
        const shouldGenerateNew = mostSimilarScore < SIMILARITY_THRESHOLD;

        return res.status(200).json({ shouldGenerateNew, mostSimilarScore });
      }

      const searchResponse = await index.query({
        vector: Array.from(queryEmbedding),
        topK: 10000,
        includeMetadata: true,
      });

      const results = searchResponse.matches.map((match) => ({
        ...match.metadata,
        score: match.score,
      }));

      const mostSimilarScore = results.length > 0 ? results[0].score : 0;
      
      const paginatedResults = results.slice(
        page * PAGE_SIZE,
        (page + 1) * PAGE_SIZE
      );

      res.status(200).json({
        results: paginatedResults,
        totalResults: results.length,
        mostSimilarScore,
      });
      
    } catch (error) {
      console.error("Vector search error:", error);
      res.status(500).json({
        error: "An error occurred during vector search",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}