import React, { useState, useEffect, useCallback } from "react";
import styles from "./Action.module.css";

const Action = () => {
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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get("state");

    if (stateParam) {
      try {
        const decodedState = JSON.parse(decodeURIComponent(stateParam));
        if (decodedState.cast) {
          setCastState(decodedState.cast);
        }
      } catch (error) {
        console.error("Error parsing state parameter:", error);
      }
    }
  }, []);

  const handleSearch = async () => {
    if (query.trim()) {
      setIsLoading(true);
      setGenerationProgress(0);
      setMemes([]);
      setErrors({});

      try {
        const checkResponse = await fetch("/api/vector-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, page: 0, checkOnly: true }),
        });

        if (!checkResponse.ok) throw new Error("Vector search check failed");
        const { shouldGenerateNew, mostSimilarScore } =
          await checkResponse.json();

        if (shouldGenerateNew) {
          const generationResponse = await fetch("/api/meme-generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ searchQuery: query }),
          });

          if (!generationResponse.ok) throw new Error("Meme generation failed");

          const reader = generationResponse.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              const data = JSON.parse(line);
              if (data.error) {
                console.error(
                  `Error generating meme ${data.index}:`,
                  data.error
                );
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  [data.index]: data.error,
                }));
              } else {
                setMemes((prevMemes) => {
                  const newMemes = [...prevMemes];
                  newMemes[data.index] = {
                    imageUrl: data.result.output,
                    score: 1,
                  };
                  return newMemes;
                });

                setGenerationProgress(((data.index + 1) / 22) * 100);

                // Store the generated meme in vector store
                await fetch("/api/vector-store", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    query,
                    imageUrls: [data.result.output],
                  }),
                });
              }
            }
          }
        } else {
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
        }
      } catch (error) {
        console.error("Search error:", error);
        alert("An error occurred while searching. Please try again.");
      } finally {
        setIsLoading(false);
        setGenerationProgress(100);
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
    try {
      window.umami.track("ActionMemeClick");
      const updatedCastState = {
        ...castState,
        embeds: [...castState.embeds, meme.imageUrl],
      };

      const postData = {
        type: "createCast",
        data: {
          cast: updatedCastState,
        },
      };

      window.parent.postMessage(postData, "*");
    } catch (error) {
      console.error("Error handling image click:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Infinite Memes ✨</h1>
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
              data-umami-event={"ActionMemeGenerate"}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
        {isLoading && (
          <div className={styles.loaderContainer}>
            <div
              className={styles.loaderBar}
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className={styles.results}>
        {memes.length > 0 || Object.keys(errors).length > 0 ? (
          <div className={styles.imageGrid}>
            {Array.from({ length: 22 }).map((_, index) => (
              <div
                key={index}
                className={styles.imageContainer}
                onClick={() => {
                  if (memes[index]) {
                    handleImageClick(memes[index]);
                  }
                }}
              >
                <div className={styles.imageWrapper}>
                  {memes[index] ? (
                    <img
                      src={memes[index].imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className={styles.image}
                    />
                  ) : errors[index] ? (
                    <div className={styles.errorContainer}>
                      <p>Error generating meme</p>
                      <p className={styles.errorMessage}>{errors[index]}</p>
                    </div>
                  ) : (
                    <div className={styles.placeholderContainer}>
                      <div className={styles.placeholderSpinner}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.messageText}>
            {isLoading
              ? "Generating memes, please wait..."
              : "Generate your memes on the search bar above 🌟"}
          </p>
        )}
        {!isLoading && !hasMore && memes.length > 0 && (
          <p className={styles.endMessage}>
            You&#39;ve reached the end of the memes 🫡
          </p>
        )}
      </div>
    </div>
  );
};

export default Action;
