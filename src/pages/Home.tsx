import { Link } from 'react-router-dom';
import ServiceSelector from '../components/ServiceSelector';
import SearchBar from '../components/SearchBar';
import ContentRow from '../components/ContentRow';
import { useServices } from '../hooks/useServices';
import { usePopular } from '../hooks/usePopular';

export default function Home() {
  const { selectedIds } = useServices();
  const { data: popular, isLoading, error } = usePopular(
    selectedIds.length > 0 ? selectedIds : undefined
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">StreamFinder</h1>
        <Link to="/watchlist" className="text-blue-400 hover:text-blue-300">
          My Watchlist
        </Link>
      </div>
      <p className="text-gray-400 mb-6">Find where to watch your favorite movies and shows</p>

      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="mb-8">
        <ServiceSelector />
      </div>

      {error && (
        <div className="text-red-400 mb-4">
          Error loading content. The API might be temporarily unavailable.
        </div>
      )}

      {isLoading && (
        <div className="text-gray-400">Loading trending content...</div>
      )}

      {popular && (
        <>
          <ContentRow
            title="Trending Movies"
            titles={popular.filter((t) => t.object_type === 'movie').slice(0, 10)}
            selectedProviderIds={selectedIds}
          />
          <ContentRow
            title="Popular TV Shows"
            titles={popular.filter((t) => t.object_type === 'show').slice(0, 10)}
            selectedProviderIds={selectedIds}
          />
        </>
      )}

      {selectedIds.length === 0 && !isLoading && (
        <p className="text-gray-500 text-sm mt-4">
          💡 Tip: Select your streaming services above to filter content to what you can actually watch.
        </p>
      )}
    </div>
  );
}
