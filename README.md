# Infinite Memes Generator

An AI-powered meme generator that creates memes from text prompts or Farcaster casts.

## Features

- **Search-based meme generation**: Enter any topic and get AI-generated memes using 29 different meme templates
- **Farcaster integration**: Generate memes based on Farcaster cast content
- **Smart caching**: Uses vector similarity search to avoid regenerating similar memes
- **Streaming responses**: Memes load progressively as they're generated

## How It Works

1. **User enters a search query** (or pastes a Farcaster cast URL)
2. **Vector search** checks if similar memes already exist in the database (using OpenAI embeddings + Pinecone)
3. If similarity score is below threshold, **new memes are generated** via GLIF API
4. Generated memes are **stored in the vector database** for future searches
5. Results are displayed with infinite scroll pagination

For Farcaster casts, GPT-4o-mini extracts a short meme topic from the cast content before generating.

## Tech Stack

- **Framework**: Next.js 14 + React 18
- **Styling**: Tailwind CSS
- **Meme Generation**: [GLIF API](https://glif.app)
- **Vector Database**: [Pinecone](https://pinecone.io)
- **Embeddings & AI**: [OpenAI](https://openai.com) (text-embedding-3-small, GPT-4o-mini)
- **Farcaster API**: [Neynar](https://neynar.com)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd infinite-memes

# Install dependencies
npm install
```

### Environment Variables

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `GLIF_API_KEY` | API key from [GLIF](https://glif.app) for meme generation |
| `OPENAI_API_KEY` | OpenAI API key for embeddings and chat completions |
| `PINECONE_API_KEY` | Pinecone API key for vector storage/search |
| `NEYNAR_API_KEY` | Neynar API key for Farcaster cast fetching |

### Running Locally

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

```
├── pages/
│   ├── index.js          # Main search page
│   ├── farcaster.js      # Farcaster meme generator
│   ├── results.js        # Search results display
│   ├── api/
│   │   ├── meme-generate.js    # GLIF meme generation endpoint
│   │   ├── vector-search.js    # Pinecone similarity search
│   │   ├── vector-store.js     # Store new memes in Pinecone
│   │   ├── fc-meme-generate.js # Farcaster-specific generation
│   │   └── fetch-cast.js       # Fetch Farcaster cast via Neynar
│   └── components/       # React components
├── public/               # Static assets
└── styles/               # Global styles
```

## Deployment

Deploy easily on [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/infinite-memes)

Make sure to add all environment variables in your Vercel project settings.

## License

MIT
