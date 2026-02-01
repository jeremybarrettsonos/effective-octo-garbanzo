import { useParams, Link } from 'react-router-dom';
import { useTitleDetail } from '../hooks/useTitleDetail';
import { useServices } from '../hooks/useServices';
import { POPULAR_PROVIDERS } from '../services/justwatch';

export default function TitleDetail() {
  const { type, id } = useParams();
  const { selectedIds } = useServices();

  const { data: title, isLoading, error } = useTitleDetail(
    type as 'movie' | 'show',
    Number(id)
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Back
        </Link>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !title) {
    return (
      <div className="p-8">
        <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Back
        </Link>
        <div className="text-red-400">Error loading title details.</div>
      </div>
    );
  }

  const posterUrl = title.poster
    ? `https://images.justwatch.com${title.poster.replace('{profile}', 's332')}`
    : null;

  // Group offers by provider, preferring flatrate (streaming)
  const streamingOffers = (title.offers || [])
    .filter((o) => o.monetization_type === 'flatrate')
    .filter((o) => selectedIds.length === 0 || selectedIds.includes(o.provider_id));

  const rentBuyOffers = (title.offers || [])
    .filter((o) => o.monetization_type === 'rent' || o.monetization_type === 'buy')
    .filter((o) => selectedIds.length === 0 || selectedIds.includes(o.provider_id));

  const getProviderName = (providerId: number) => {
    return POPULAR_PROVIDERS.find((p) => p.id === providerId)?.clear_name || `Provider ${providerId}`;
  };

  const imdbScore = title.scoring?.find((s) => s.imdb_score)?.imdb_score;

  return (
    <div className="p-8">
      <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
        ← Back
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="flex-shrink-0">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title.title}
              className="w-48 rounded-lg"
            />
          ) : (
            <div className="w-48 aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title.title}</h1>
          <p className="text-gray-400 mb-4">
            {title.original_release_year} • {type === 'movie' ? 'Movie' : 'TV Show'}
            {imdbScore && ` • ⭐ ${imdbScore.toFixed(1)}`}
          </p>

          {title.short_description && (
            <p className="text-gray-300 mb-6 max-w-2xl">{title.short_description}</p>
          )}

          {/* Streaming Options */}
          {streamingOffers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Stream On:</h2>
              <div className="flex flex-wrap gap-2">
                {[...new Map(streamingOffers.map((o) => [o.provider_id, o])).values()].map((offer) => (
                  <a
                    key={offer.provider_id}
                    href={offer.urls.standard_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                  >
                    ▶ {getProviderName(offer.provider_id)}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rent/Buy Options */}
          {rentBuyOffers.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Rent or Buy:</h2>
              <div className="flex flex-wrap gap-2">
                {[...new Map(rentBuyOffers.map((o) => [o.provider_id, o])).values()].map((offer) => (
                  <a
                    key={offer.provider_id}
                    href={offer.urls.standard_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                  >
                    {getProviderName(offer.provider_id)}
                    {offer.retail_price && ` - $${offer.retail_price}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          {streamingOffers.length === 0 && rentBuyOffers.length === 0 && (
            <p className="text-gray-400">
              Not available on your selected services.
              {selectedIds.length > 0 && ' Try adding more services on the home page.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
