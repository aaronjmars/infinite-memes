import React, { useState, useEffect, useCallback } from "react";
import styles from "./action.module.css";

export default function Action() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [memes, setMemes] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [castState, setCastState] = useState({
    text: "",
    embeds: [],
    parent: null,
  });
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get("state");
    console.log("Raw state parameter:", stateParam);

    if (stateParam) {
      try {
        const decodedState = JSON.parse(decodeURIComponent(stateParam));
        console.log("Decoded state:", decodedState);

        if (decodedState.cast) {
          console.log("Setting castState to:", decodedState.cast);
          setCastState(decodedState.cast);
        } else {
          console.log("No 'cast' property found in decoded state");
        }
      } catch (error) {
        console.error("Error parsing state parameter:", error);
      }
    } else {
      console.log("No state parameter found in URL");
    }
  }, []);

  useEffect(() => {
    console.log("Current castState:", castState);
  }, [castState]);

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

  const handleImageClick = (meme) => {
    console.log(castState);
    try {
      const updatedCastState = {
        ...castState,
        embeds: [...castState.embeds, meme.imageUrl[0]],
      };

      const postData = {
        type: "createCast",
        data: {
          cast: updatedCastState,
        },
      };

      window.parent.postMessage(postData, "*");
      console.log("PostMessage sent successfully");
      // Update local state
      setCastState(updatedCastState);
    } catch (error) {
      console.error("Error sending postMessage:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <div
          className={`${styles.searchWrapper} ${
            isFocused
              ? styles.searchWrapperFocused
              : styles.searchWrapperBlurred
          }`}
        >
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={styles.input}
              placeholder="What's the meme about?"
            />
            <button
              onClick={handleSearch}
              className={`${styles.button} ${
                isLoading ? styles.buttonDisabled : styles.buttonEnabled
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.results}>
        {memes.length > 0 ? (
          <div className={styles.imageGrid}>
            {memes.map((meme, index) => (
              <div
                key={index}
                className={styles.imageContainer}
                onClick={() => handleImageClick(meme)}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={meme.imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className={styles.image}
                  />
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
            You&#39;ve reached the end of the memes 🫡
          </p>
        )}
      </div>
    </div>
  );
}
