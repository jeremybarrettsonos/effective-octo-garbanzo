import type { Title } from '../types/justwatch';
import ContentCard from './ContentCard';

interface ContentRowProps {
  title: string;
  titles: Title[];
  selectedProviderIds?: number[];
}

export default function ContentRow({ title, titles, selectedProviderIds = [] }: ContentRowProps) {
  if (titles.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {titles.map((t) => (
          <div key={`${t.object_type}-${t.id}`} className="flex-shrink-0 w-36">
            <ContentCard title={t} selectedProviderIds={selectedProviderIds} />
          </div>
        ))}
      </div>
    </div>
  );
}
