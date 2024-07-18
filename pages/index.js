import SearchBar from './components/SearchBar';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-8">AI Meme Generator</h1>
      <SearchBar />
    </div>
  );
}