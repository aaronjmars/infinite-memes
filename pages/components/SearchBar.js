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
        const response = await fetch("/api/meme-generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ searchQuery: query }),
        });

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const results = await response.json();
        const imageUrls = results
          .map((result) => result.output)
          .filter((url) => url);

        if (imageUrls.length === 0) {
          throw new Error("No images were generated");
        }

        router.push({
          pathname: "/results",
          query: { imageUrls: JSON.stringify(imageUrls) },
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
  );
}