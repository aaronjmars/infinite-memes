import ids from '../imageGeneratorIDs.json';
export const config = {
  maxDuration: 60,
};
const apiToken = process.env.GLIF_API_KEY;
const apiUrl = 'https://simple-api.glif.app';

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const { searchQuery } = req.body;
  
        if (!searchQuery) {
          return res.status(400).json({ error: 'Search query is required' });
        }
  
        const requests = ids.ids.slice(0, 15).map(id => fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: id,
            inputs: [searchQuery]
          })
        }));
  
        const responses = await Promise.all(requests);
        const results = await Promise.all(responses.map(response => response.json()));
    
        res.status(200).json(results);
      } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }