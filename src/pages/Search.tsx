import { useSearchParams } from 'react-router-dom';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Search Results</h1>
      <p className="text-gray-400">Results for: {query}</p>
    </div>
  );
}
