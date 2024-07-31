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
  const {
    initialResults,
    totalResults,
    searchQuery,
    similarityScore,
    isNewlyGenerated,
  } = router.query;

  const [memes, setMemes] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    console.log("Initial render:", {
      initialResults,
      totalResults,
      isNewlyGenerated,
    });
    setIsInIframe(window.self !== window.top);
    if (initialResults) {
      const parsedResults = JSON.parse(initialResults);
      console.log("Setting initial memes:", parsedResults.length);
      setMemes(parsedResults);
      setHasMore(parsedResults.length < parseInt(totalResults));
    }
  }, [initialResults, totalResults]);

  const loadMoreMemes = useCallback(async () => {
    console.log("loadMoreMemes called:", {
      loading,
      hasMore,
      page,
      memes: memes.length,
    });
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      console.log("Fetching more memes:", {
        query: searchQuery,
        page: nextPage,
      });
      const response = await fetch("/api/vector-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          page: nextPage,
        }),
      });
      const data = await response.json();
      console.log("Received data:", {
        resultsLength: data.results.length,
        totalResults: data.totalResults,
      });
      if (data.results.length > 0) {
        setMemes((prevMemes) => {
          const newMemes = [...prevMemes, ...data.results];
          console.log("Updated memes:", newMemes.length);
          return newMemes;
        });
        setPage(nextPage);
        setHasMore(
          memes.length + data.results.length < parseInt(data.totalResults)
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more memes:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchQuery, memes.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        console.log("Scroll threshold reached");
        loadMoreMemes();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreMemes]);

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
        <h2 className="text-2xl font-bold mb-4">Results for: {searchQuery}</h2>
        {isNewlyGenerated === "true" ? (
          <p className="mb-4">New memes generated for this query!</p>
        ) : (
          <p className="mb-4">
            Showing existing memes (Similarity score:{" "}
            {(parseFloat(similarityScore) * 100).toFixed(2)}%)
          </p>
        )}
        {memes.length > 0 ? (
          <div
            className={`${styles.imageGrid} ${
              isInIframe ? styles.iframeImageGrid : ""
            }`}
          >
            {memes.map((meme, index) => (
              <div
                key={index}
                className={`${styles.imageContainer} ${
                  isInIframe ? styles.iframeImageContainer : ""
                }`}
                onClick={() => handleImageClick(meme.imageUrl)}
              >
                <div className={styles.imageWrapper}>
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
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-700 dark:text-gray-300">
            No images generated. Please try again.
          </p>
        )}
        {loading && <p className="text-center mt-4">Loading more memes...</p>}
        {!hasMore && (
          <p className="text-center mt-4">
            You've reached the end of the memes 🫡
          </p>
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
