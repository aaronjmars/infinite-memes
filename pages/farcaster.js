import Cast from "./components/Cast";
import Footer from "./components/Footer";
import { Helmet } from "react-helmet";
import { Analytics } from "@vercel/analytics/react";
import styles from "./index.module.css";

export default function Farcaster() {
  return (
    <>
      <Helmet>
        <title>Farcaster Meme Generator ✨</title>
        <meta property="og:title" content="Farcaster Meme Generator ✨" />
        <meta
          property="og:description"
          content="Generate memes based on a cast."
        />
        <meta property="og:url" content="https://infinitememes.lol/farcaster" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://infinitememes.lol/INFINITE-MEMES.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Farcaster Meme Generator ✨" />
        <meta
          name="twitter:description"
          content="Generate memes based on a cast."
        />
        <meta
          name="twitter:image"
          content="https://infinitememes.lol/INFINITE-MEMES.png"
        />
      </Helmet>
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
