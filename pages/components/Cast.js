import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "./Cast.module.css";

const Cast = () => {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleURLChange = (e) => {
    setUrl(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const isValidWarpcastUrl = (url) => {
    try {
      const { hostname } = new URL(url);
      return hostname === "warpcast.com";
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setContent("");
    setAnalysis("");

    if (!isValidWarpcastUrl(url)) {
      setError("Invalid URL: Please provide a valid warpcast.com URL.");
      setIsLoading(false);
      return;
    }

    try {
      const contentResponse = await fetch("/api/fetch-cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!contentResponse.ok) {
        throw new Error("Failed to fetch content");
      }

      const { content: fetchedContent } = await contentResponse.json();
      console.log(fetchedContent);
      setContent(fetchedContent);

      const analysisResponse = await fetch("/api/fc-meme-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fetchedContent }),
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze content");
      }

      const results = await analysisResponse.json();
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
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.searchWrapper} ${
          isFocused
            ? styles.searchWrapperFocused
            : styles.searchWrapperBlurred
        }`}
      >
        <div className={styles.inputWrapper}>
          <input
            type="url"
            value={url}
            onChange={handleURLChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Paste a Cast URL"
            required
            className={styles.input}
          />
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className={`${styles.button} ${
              isLoading ? styles.buttonDisabled : styles.buttonEnabled
            }`}
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>Error: {error}</p>}

      {analysis && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Analysis:</h2>
          <p className={styles.content}>{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default Cast;