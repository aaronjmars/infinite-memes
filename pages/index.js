import Head from 'next/head';
import SearchBar from './components/SearchBar';
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  return (
    <>
      <Head>
        <link rel="icon" href="favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <title>Infinite Memes Generator</title>
        <meta
          name="description"
          content="Generate infinite memes with AI"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Infinite Memes Generator"
        />
        <meta
          property="og:description"
          content="Generate infinite memes with AI"
        />
        <meta
          property="og:image"
          content="https://infinitememe.lol/INFINITE-MEMES.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Infinite Meme Generator"
        />
        <meta
          name="twitter:description"
          content="Generate infinite memes with AI"
        />
        <meta
          name="twitter:image"
          content="https://infinitememe.lol/INFINITE-MEMES.png"
        />
        <meta property="og:url" content="https://infinitememes.lol/" />
      </Head>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <h1 className="text-4xl font-bold mb-8">Infinite Memes Generator</h1>
          <SearchBar />
          <Analytics />
        </div>
    </>
  );
}