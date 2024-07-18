import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Results() {
  const router = useRouter();
  const { imageUrls } = router.query;

  const [shuffledUrls, setShuffledUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (imageUrls) {
      const parsed = JSON.parse(imageUrls);
      setShuffledUrls([...parsed].sort(() => Math.random() - 0.5));
    }
  }, [imageUrls]);

  const openFullscreen = (url) => {
    setSelectedImage(url);
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {shuffledUrls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shuffledUrls.map((url, index) => (
              <div key={index} className="rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  <div className="relative p-0.5 bg-white group-hover:bg-transparent transition-colors duration-300 rounded-lg">
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={url} 
                        alt={`Generated image ${index + 1}`} 
                        className="w-full h-full object-contain rounded-lg"
                        onClick={() => openFullscreen(url)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No images generated. Please try again.</p>
        )}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-block bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 transition-colors">
            Generate More Memes
          </Link>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeFullscreen}>
          <div className="max-w-4xl max-h-full p-4">
            <img src={selectedImage} alt="Full-size image" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}