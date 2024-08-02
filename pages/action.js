import React, { useState, useEffect, useCallback } from "react";
import styles from './action.module.css';

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

export default function CombinedSearchResults() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [memes, setMemes] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (query.trim()) {
      setIsLoading(true);
      try {
        const checkResponse = await fetch("/api/vector-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, page: 0, checkOnly: true }),
        });

        if (!checkResponse.ok) throw new Error("Vector search check failed");
        const { shouldGenerateNew, mostSimilarScore } =
          await checkResponse.json();

        let generatedMemes = [];
        if (shouldGenerateNew) {
          const generationResponse = await fetch("/api/meme-generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ searchQuery: query }),
          });

          if (!generationResponse.ok) throw new Error("Meme generation failed");
          generatedMemes = await generationResponse.json();

          await fetch("/api/vector-store", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query,
              imageUrls: generatedMemes
                .map((meme) => meme.output)
                .filter((url) => url),
            }),
          });
        }

        const searchResponse = await fetch("/api/vector-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, page: 0 }),
        });

        if (!searchResponse.ok) throw new Error("Vector search failed");
        const { results, totalResults } = await searchResponse.json();

        setMemes(results);
        setTotalResults(totalResults);
        setHasMore(results.length < totalResults);
        setPage(0);
      } catch (error) {
        console.error("Search error:", error);
        alert("An error occurred while searching. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadMoreMemes = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch("/api/vector-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page: nextPage }),
      });
      const data = await response.json();

      if (data.results.length > 0) {
        setMemes((prevMemes) => [...prevMemes, ...data.results]);
        setPage(nextPage);
        setHasMore(memes.length + data.results.length < totalResults);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more memes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, query, memes.length, totalResults]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreMemes();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreMemes]);

  const handleImageClick = (imageUrl) => {
    try {
      const postData = {
        type: "createCast",
        data: {
          cast: {
            embeds: [imageUrl],
          },
        },
      };
      window.parent.postMessage(postData, "*");
    } catch (error) {
      console.error("Error sending postMessage:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className={styles.input}
          placeholder="What's the meme about?"
        />
        <button
          onClick={handleSearch}
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </div>

      <div className={styles.results}>
        {memes.length > 0 ? (
          <div className={styles.imageGrid}>
            {memes.map((meme, index) => (
              <div
                key={index}
                className={styles.imageContainer}
                onClick={() => handleImageClick(meme.imageUrl)}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={meme.imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className={styles.image}
                  />
                  <div className={styles.imageActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implement copy to clipboard functionality
                      }}
                      className={styles.actionButton}
                      aria-label="Copy to clipboard"
                    >
                      <CopyIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implement download functionality
                      }}
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
          <p className={styles.noResults}>
            No images generated. Please try a search.
          </p>
        )}
        {isLoading && <p className={styles.loading}>Loading more memes...</p>}
        {!hasMore && (
          <p className={styles.endMessage}>
            You've reached the end of the memes 🫡
          </p>
        )}
      </div>
    </div>
  );
}
