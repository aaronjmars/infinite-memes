import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from '@xenova/transformers';

let pinecone = null;
let encoder = null;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { query, imageUrls } = req.body;

      if (!query || !imageUrls || !Array.isArray(imageUrls)) {
        return res.status(400).json({ error: 'Query and imageUrls array are required' });
      }

      if (!pinecone) {
        pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
      }

      if (!encoder) {
        encoder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      }

      const index = pinecone.Index('meme-vectors');

      // Generate embedding for the query
      const queryEmbedding = await encoder(query, { pooling: 'mean', normalize: true });

      // Store vectors for each image URL
      const vectors = imageUrls.map((imageUrl, i) => ({
        id: `${Date.now()}-${i}`,
        values: Array.from(queryEmbedding.data),
        metadata: { query, imageUrl },
      }));

      await index.upsert(vectors);

      res.status(200).json({ message: 'Vectors stored successfully' });
    } catch (error) {
      console.error('Vector store error:', error);
      res.status(500).json({ error: 'An error occurred while storing vectors', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}