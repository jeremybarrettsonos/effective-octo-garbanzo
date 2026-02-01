import { POPULAR_PROVIDERS } from '../services/justwatch';

interface ServiceBadgeProps {
  providerId: number;
  small?: boolean;
}

export default function ServiceBadge({ providerId, small = false }: ServiceBadgeProps) {
  const provider = POPULAR_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return null;

  const initials = provider.clear_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-gray-700 text-white font-medium ${
        small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
      }`}
      title={provider.clear_name}
    >
      {initials}
    </span>
  );
}
