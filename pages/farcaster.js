import Cast from "./components/Cast";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
import styles from "./index.module.css";

export default function Farcaster() {
  return (
    <>
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
