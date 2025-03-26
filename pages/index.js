import Head from "next/head";
import SearchBar from "./components/SearchBar";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
import styles from "./index.module.css";
import Script from "next/script";

export default function Home() {
  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="favicon-16x16.png"
        />
        <link rel="manifest" href="site.webmanifest" />
        <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <title>Infinite Memes Generator</title>
        <meta name="description" content="Generate infinite memes with AI" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Infinite Memes Generator" />
        <meta
          property="og:description"
          content="Generate infinite memes with AI"
        />
        <meta property="og:image" content="https://infinitememes.lol/OG.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@leo5imon" />
        <meta name="twitter:title" content="Infinite Memes Generator" />
        <meta
          name="twitter:description"
          content="Generate infinite memes with AI"
        />
        <meta name="twitter:image" content="https://infinitememes.lol/OG.png" />
        <meta property="og:url" content="https://infinitememes.lol/" />
      </Head>
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="4a6ad139-9f43-482c-ab1c-179920236491"
      />
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className={styles.title}>Infinite Memes Generator ✨</h1>
          <SearchBar />
        </div>
        <Footer />
      </div>
      <Analytics />
    </>
  );
}
