import { useServices } from '../hooks/useServices';

export default function ServiceSelector() {
  const { providers, toggle, isSelected } = useServices();

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-gray-400 mr-2">My Services:</span>
      {providers.map((provider) => (
        <button
          key={provider.id}
          onClick={() => toggle(provider.id)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            isSelected(provider.id)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {provider.clear_name}
        </button>
      ))}
    </div>
  );
}
