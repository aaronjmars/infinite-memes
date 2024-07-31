import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";

let pinecone = null;
let encoder = null;

const SIMILARITY_THRESHOLD = 0.8;
const PAGE_SIZE = 20;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { query, page = 0, checkOnly = false } = req.body;
      console.log("Received request:", { query, page, checkOnly });

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (!pinecone) {
        pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
      }

      if (!encoder) {
        encoder = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2"
        );
      }

      const index = pinecone.Index("meme-vectors");

      const queryEmbedding = await encoder(query, {
        pooling: "mean",
        normalize: true,
      });

      // For the initial check, we only need to know if we should generate new memes
      if (checkOnly) {
        const checkResponse = await index.query({
          vector: Array.from(queryEmbedding.data),
          topK: 1,
          includeMetadata: true,
        });

        const mostSimilarScore =
          checkResponse.matches.length > 0 ? checkResponse.matches[0].score : 0;
        const shouldGenerateNew = mostSimilarScore < SIMILARITY_THRESHOLD;

        console.log("Similarity check result:", {
          mostSimilarScore,
          shouldGenerateNew,
        });

        return res.status(200).json({ shouldGenerateNew, mostSimilarScore });
      }

      // For the full search, we retrieve all relevant memes
      const searchResponse = await index.query({
        vector: Array.from(queryEmbedding.data),
        topK: 10000,
        includeMetadata: true,
      });

      const results = searchResponse.matches.map((match) => ({
        ...match.metadata,
        score: match.score,
      }));

      const mostSimilarScore = results.length > 0 ? results[0].score : 0;

      console.log("Search results:", {
        totalResults: results.length,
        mostSimilarScore,
      });

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
