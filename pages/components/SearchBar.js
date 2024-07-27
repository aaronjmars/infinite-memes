import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/meme-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ searchQuery: query }),
        });

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const results = await response.json();
        const imageUrls = results.map(result => result.output).filter(url => url);
        
        if (imageUrls.length === 0) {
          throw new Error('No images were generated');
        }

        router.push({
          pathname: '/results',
          query: { imageUrls: JSON.stringify(imageUrls) }
        });
      } catch (error) {
        console.error('Search error:', error);
        alert('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} action="" className="w-full max-w-lg px-4 sm:px-0">
      <div className={`
        p-0.5 sm:p-1 rounded-full
        ${isFocused 
          ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500' 
          : 'bg-gray-300'
        }
        transition-all duration-300 ease-in-out
      `}>
        <div className="
          flex items-center
          bg-white rounded-full
          p-1 sm:p-2
        ">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-grow focus:outline-none text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-2 text-gray-800"
            placeholder="What's the meme about ?"
          />
          <button 
            type="submit" 
            className={`
              ml-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-white text-xs sm:text-sm
              transition-all duration-300 ease-in-out
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600'
              }
            `}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </form>
  );
}