import { Link } from 'react-router-dom';
import type { Title } from '../types/justwatch';
import ServiceBadge from './ServiceBadge';

interface ContentCardProps {
  title: Title;
  selectedProviderIds?: number[];
}

export default function ContentCard({ title, selectedProviderIds = [] }: ContentCardProps) {
  const posterUrl = title.poster
    ? `https://images.justwatch.com${title.poster.replace('{profile}', 's166')}`
    : null;

  // Get unique provider IDs from offers, filtered by selected providers
  const availableProviderIds = [
    ...new Set(
      (title.offers || [])
        .filter((o) => o.monetization_type === 'flatrate')
        .map((o) => o.provider_id)
        .filter((id) => selectedProviderIds.length === 0 || selectedProviderIds.includes(id))
    ),
  ];

  return (
    <Link
      to={`/title/${title.object_type}/${title.id}`}
      className="block group"
    >
      <div className="relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        {availableProviderIds.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {availableProviderIds.slice(0, 3).map((id) => (
              <ServiceBadge key={id} providerId={id} small />
            ))}
          </div>
        )}
      </div>

      <h3 className="mt-2 text-sm font-medium truncate group-hover:text-blue-400">
        {title.title}
      </h3>
      <p className="text-xs text-gray-400">
        {title.original_release_year} • {title.object_type === 'movie' ? 'Movie' : 'TV'}
      </p>
    </Link>
  );
}
