import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingProgress((oldProgress) => {
          const newProgress = oldProgress + 100 / 150; // Increment over 15 seconds (150 * 100ms)
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100);
    } else {
      setLoadingProgress(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  const handleSearch = async () => {
    if (query.trim()) {
      setIsLoading(true);
      setLoadingProgress(0);
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

        router.push({
          pathname: "/results",
          query: {
            initialResults: JSON.stringify(results),
            totalResults,
            searchQuery: query,
            similarityScore: mostSimilarScore,
            isNewlyGenerated: shouldGenerateNew.toString(),
          },
        });
      } catch (error) {
        console.error("Search error:", error);
        alert("An error occurred while searching. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.searchWrapper} ${
          isFocused ? styles.searchWrapperFocused : styles.searchWrapperBlurred
        }`}
      >
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            className={styles.input}
            placeholder="What's the meme about?"
            disabled={isLoading}
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
      {isLoading && (
        <div className={styles.loaderContainer}>
          <div
            className={styles.loaderBar}
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
