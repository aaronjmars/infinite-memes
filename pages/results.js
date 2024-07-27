import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./results.module.css";

export default function Results() {
  const router = useRouter();
  const { imageUrls } = router.query;

  const [shuffledUrls, setShuffledUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if the component is rendered inside an iframe
    setIsInIframe(window.self !== window.top);
    if (imageUrls) {
      const parsed = JSON.parse(imageUrls);
      setShuffledUrls([...parsed].sort(() => Math.random() - 0.5));
    }
  }, [imageUrls]);

  const openFullscreen = (url) => {
    if (!isInIframe) {
      setSelectedImage(url);
    }
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  return (
    <div
      className={`${styles.container} ${
        isInIframe ? styles.iframeContainer : ""
      }`}
    >
      {!isInIframe && (
        <div className="mt-8 text-center">
          <Link href="/" className={styles.generateButton}>
            Generate More Memes
          </Link>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {shuffledUrls.length > 0 ? (
          <div
            className={`${styles.imageGrid} ${
              isInIframe ? styles.iframeImageGrid : ""
            }`}
          >
            {shuffledUrls.map((url, index) => (
              <div
                key={index}
                className={`${styles.imageContainer} ${
                  isInIframe ? styles.iframeImageContainer : ""
                }`}
                onClick={() => openFullscreen(url)}
              >
                {/* This wrapper creates the gradient border effect on hover */}
                <div className={styles.imageWrapper}>
                  <img
                    src={url}
                    alt={`Generated image ${index + 1}`}
                    className={`${styles.image} ${
                      isInIframe ? styles.iframeImage : ""
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No images generated. Please try again.</p>
        )}
      </div>

      {selectedImage && !isInIframe && (
        <div className={styles.fullscreenOverlay} onClick={closeFullscreen}>
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={selectedImage}
              alt="Full-size image"
              className={styles.fullscreenImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
