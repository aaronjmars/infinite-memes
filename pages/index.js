import Head from 'next/head';
import SearchBar from './components/SearchBar';
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png"/>
        <link rel="manifest" href="site.webmanifest"/>
        <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5"/>
        <meta name="msapplication-TileColor" content="#da532c"/>
        <meta name="theme-color" content="#ffffff"/>
        
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