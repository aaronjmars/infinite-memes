import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./results.module.css";

export default function Results() {
  const router = useRouter();
  const { imageUrls } = router.query;

  const [shuffledUrls, setShuffledUrls] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
    if (imageUrls) {
      const parsed = JSON.parse(imageUrls);
      setShuffledUrls([...parsed].sort(() => Math.random() - 0.5));
    }
  }, [imageUrls]);

  const handleImageClick = (url) => {
    setZoomedImage(url);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  return (
    <div className={`${styles.container} ${isInIframe ? styles.iframeContainer : ""}`}>
      {!isInIframe && (
        <div className="mt-8 text-center">
          <Link href="/" className={styles.generateButton}>
            Generate More Memes
          </Link>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {shuffledUrls.length > 0 ? (
          <div className={`${styles.imageGrid} ${isInIframe ? styles.iframeImageGrid : ""}`}>
            {shuffledUrls.map((url, index) => (
              <div
                key={index}
                className={`${styles.imageContainer} ${isInIframe ? styles.iframeImageContainer : ""}`}
                onClick={() => handleImageClick(url)}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={url}
                    alt={`Generated image ${index + 1}`}
                    className={`${styles.image} ${isInIframe ? styles.iframeImage : ""}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No images generated. Please try again.</p>
        )}
      </div>

      {zoomedImage && (
        <div className={styles.zoomOverlay} onClick={closeZoom}>
          <div className={styles.zoomImageContainer}>
            <img
              src={zoomedImage}
              alt="Zoomed image"
              className={styles.zoomImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}