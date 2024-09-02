import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

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
        const { shouldGenerateNew, mostSimilarScore } = await checkResponse.json();

        let initialResults = [];
        if (!shouldGenerateNew) {
          // Fetch existing results
          const searchResponse = await fetch("/api/vector-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, page: 0 }),
          });

          if (!searchResponse.ok) throw new Error("Vector search failed");
          const { results } = await searchResponse.json();
          initialResults = results;
        }

        // Redirect to results page immediately
        router.push({
          pathname: "/results",
          query: {
            initialResults: JSON.stringify(initialResults),
            searchQuery: query,
            similarityScore: mostSimilarScore,
            isNewlyGenerated: shouldGenerateNew.toString(),
          },
        });

      } catch (error) {
        console.error("Search error:", error);
        alert("An error occurred while searching. Please try again.");
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
            data-umami-event={"MemeGenerate"}
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
  );
}