import { Link } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';

export default function Watchlist() {
  const { items, remove } = useWatchlist();

  return (
    <div className="p-8">
      <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
        ← Back to Home
      </Link>

      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>

      {items.length === 0 ? (
        <p className="text-gray-400">
          Your watchlist is empty. Browse movies and shows to add some!
        </p>
      ) : (
        <div className="space-y-4">
          {items
            .sort((a, b) => b.addedAt - a.addedAt)
            .map((item) => {
              const posterUrl = item.poster
                ? `https://images.justwatch.com${item.poster.replace('{profile}', 's166')}`
                : null;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-4 bg-gray-800 rounded-lg p-4"
                >
                  <Link to={`/title/${item.type}/${item.id}`} className="flex-shrink-0">
                    {posterUrl ? (
                      <img src={posterUrl} alt={item.title} className="w-16 rounded" />
                    ) : (
                      <div className="w-16 aspect-[2/3] bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/title/${item.type}/${item.id}`}
                      className="font-medium hover:text-blue-400 truncate block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-400">
                      {item.year} • {item.type === 'movie' ? 'Movie' : 'TV Show'}
                    </p>
                  </div>

                  <button
                    onClick={() => remove(item.id, item.type)}
                    className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
