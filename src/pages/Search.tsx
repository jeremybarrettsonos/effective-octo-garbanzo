import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { useServices } from '../hooks/useServices';
import ContentCard from '../components/ContentCard';
import SearchBar from '../components/SearchBar';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { selectedIds } = useServices();

  const { data: titles, isLoading, error } = useSearch(query, selectedIds.length > 0 ? selectedIds : undefined);

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <SearchBar />
      </div>

      {query && (
        <p className="text-gray-400 mb-4">
          Results for "{query}"
          {selectedIds.length > 0 && ` (filtered to your ${selectedIds.length} services)`}
        </p>
      )}

      {isLoading && (
        <div className="text-gray-400">Searching...</div>
      )}

      {error && (
        <div className="text-red-400">
          Error searching. The API might be temporarily unavailable.
        </div>
      )}

      {titles && titles.length === 0 && (
        <div className="text-gray-400">No results found.</div>
      )}

      {titles && titles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {titles.map((title) => (
            <ContentCard
              key={`${title.object_type}-${title.id}`}
              title={title}
              selectedProviderIds={selectedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
