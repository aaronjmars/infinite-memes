import Cast from "./components/Cast";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
import styles from "./index.module.css";

export default function Farcaster() {
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

        <title>Farcaster Memes Generator</title>
        <meta name="description" content="Generate memes based on a Cast" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Farcaster Memes Generator" />
        <meta
          property="og:description"
          content="Generate memes based on a Cast"
        />
        <meta
          property="og:image"
          content="https://infinitememes.lol/INFINITE-MEMES.png"
        />
        <meta name="twitter:card" content="player" />
        <meta name="twitter:site" content="@leo5imon" />
        <meta name="twitter:title" content="Infinite Memes Generator" />
        <meta
          name="twitter:description"
          content="Generate infinite memes with AI"
        />

        <meta name="twitter:player" content="https://infinitememes.lol/" />

        <meta name="twitter:player:width" content="360" />
        <meta name="twitter:player:height" content="560" />
        <meta
          name="twitter:image"
          content="https://infinitememes.lol/INFINITE-MEMES.png"
        />
        <meta property="og:url" content="https://infinitememes.lol/" />
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className={styles.title}>Farcaster Meme Generator ✨</h1>
          <Cast />
        </div>
        <Footer />
      </div>
      <Analytics />
    </>
  );
}
