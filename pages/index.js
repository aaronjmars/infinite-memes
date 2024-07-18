import Head from 'next/head';
import SearchBar from './components/SearchBar';
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  return (
    <>
      <Head>
        <link rel="icon" href="favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <title>Based Memecoin Race</title>
        <meta
          name="description"
          content="Find the best Farcaster memes with AI, share them and fucking win."
        />
        <meta
          property="og:title"
          content="Based Memecoin Race - Who's the leading memecoin on Base ?"
        />
        <meta
          property="og:description"
          content="Find out who's leading the memecoin race on Base."
        />
        <meta
          property="og:image"
          content="https://imagedelivery.net/uzmvUOBJ09s_IX7VWocbxw/1a917650-08d5-4635-3b09-ed82bf64f300/public"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Based Memecoin Race - Who's the leading memecoin on Base ?"
        />
        <meta
          name="twitter:description"
          content="Find out who's leading the memecoin race on Base."
        />
        <meta
          name="twitter:image"
          content="https://imagedelivery.net/uzmvUOBJ09s_IX7VWocbxw/1a917650-08d5-4635-3b09-ed82bf64f300/public"
        />
        <meta property="og:url" content="https://basedrace.fun/" />
      </Head>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <h1 className="text-4xl font-bold mb-8">AI Meme Generator</h1>
          <SearchBar />
          <Analytics />
        </div>
      </body>
    </>
  );
}