import ServiceSelector from '../components/ServiceSelector';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">StreamFinder</h1>
      <p className="text-gray-400 mb-6">Find where to watch your favorite movies and shows</p>

      <div className="mb-6">
        <SearchBar />
      </div>

      <ServiceSelector />
    </div>
  );
}
