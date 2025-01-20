import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./results.module.css";

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export default function Results() {
  const router = useRouter();
  const { initialResults, searchQuery, similarityScore, isNewlyGenerated } =
    router.query;

  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
    if (initialResults) {
      const parsedResults = JSON.parse(initialResults);
      setMemes(parsedResults);
      setLoading(false);
    }
    if (isNewlyGenerated === "true" && searchQuery) {
      generateMemes();
    }
  }, [initialResults, isNewlyGenerated, searchQuery]);

  useEffect(() => {
    let timer;
    if (generating) {
      const startTime = Date.now();
      const duration = 30000; // 30 seconds

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setGenerationProgress(progress);

        if (progress < 100) {
          timer = requestAnimationFrame(updateProgress);
        }
      };

      timer = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (timer) {
        cancelAnimationFrame(timer);
      }
    };
  }, [generating]);

  const generateMemes = useCallback(async () => {
    setGenerating(true);
    setErrors({});
    try {
      const response = await fetch("/api/meme-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          const data = JSON.parse(line);
          if (data.error) {
            console.error(`Error generating meme ${data.index}:`, data.error);
            setErrors((prevErrors) => ({
              ...prevErrors,
              [data.index]: data.error,
            }));
          } else {
            setMemes((prevMemes) => {
              const newMemes = [...prevMemes];
              newMemes[data.index] = { imageUrl: data.result.output, score: 1 };
              return newMemes;
            });

            // Store the generated meme in vector store
            await fetch("/api/vector-store", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: searchQuery,
                imageUrls: [data.result.output],
              }),
            });
          }
        }
      }
    } catch (error) {
      console.error("Meme generation error:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: "An error occurred during meme generation. Please try again.",
      }));
    } finally {
      setGenerating(false);
      setGenerationProgress(100);
    }
  }, [searchQuery]);

  const handleImageClick = (url) => {
    setZoomedImage(url);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const copyToClipboard = async (imageUrl, event) => {
    event.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    } catch (err) {
      console.error("Failed to copy image: ", err);
    }
  };

  const downloadImage = async (imageUrl, event) => {
    event.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meme-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image: ", err);
    }
  };
  
  const shouldShowImage = (meme, index) => {
    if (!meme) return false;
    if (!errors[index]) return true;
    return errors[index] !== "Invalid response from meme generation API";
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
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading initial results...</p>
          </div>
        ) : (
          <>
            {generating && (
              <div className={styles.generationProgressContainer}>
                <div
                  className={styles.generationProgressBar}
                  style={{ width: `${generationProgress}%` }}
                ></div>
                <div className={styles.generationProgressText}>
                  Generating memes: {Math.round(generationProgress)}%
                </div>
              </div>
            )}
            {errors.general && (
              <p className="text-center text-red-500 mb-4">{errors.general}</p>
            )}
            {memes.length > 0 ? (
              <div
                className={`${styles.imageGrid} ${
                  isInIframe ? styles.iframeImageGrid : ""
                }`}
              >
                {memes.map(
                  (meme, index) =>
                    shouldShowImage(meme, index) && (
                      <div
                        key={index}
                        className={`${styles.imageContainer} ${
                          isInIframe ? styles.iframeImageContainer : ""
                        }`}
                      >
                        <div
                          className={styles.imageWrapper}
                          onClick={() => handleImageClick(meme.imageUrl)}
                        >
                          <img
                            src={meme.imageUrl}
                            alt={`Generated image ${index + 1}`}
                            className={`${styles.image} ${
                              isInIframe ? styles.iframeImage : ""
                            }`}
                          />
                          <div className={styles.imageActions}>
                            <button
                              onClick={(e) => copyToClipboard(meme.imageUrl, e)}
                              className={styles.actionButton}
                              aria-label="Copy to clipboard"
                            >
                              <CopyIcon />
                            </button>
                            <button
                              onClick={(e) => downloadImage(meme.imageUrl, e)}
                              className={styles.actionButton}
                              aria-label="Download image"
                            >
                              <DownloadIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
            ) : (
              <p className="text-center text-gray-700 dark:text-gray-300">
                Generating images, please wait...
              </p>
            )}
          </>
        )}
      </div>

      {zoomedImage && (
        <div className={styles.fullscreenOverlay} onClick={closeZoom}>
          <img
            src={zoomedImage}
            alt="Fullscreen image"
            className={styles.fullscreenImage}
          />
        </div>
      )}
    </div>
  );
}
