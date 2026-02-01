# StreamFinder Web Prototype Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React web app that lets users search and browse streaming content across their services using JustWatch data.

**Architecture:** React SPA with TypeScript, using React Query for API state management. JustWatch unofficial API provides content data. Local storage persists user's service selections and watchlist.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, React Query, Axios

---

## Task 1: Project Setup

**Files:**
- Create: `package.json` (via Vite)
- Create: `tailwind.config.js`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

**Step 1: Initialize Vite project**

Run:
```bash
cd ~/projects/streamfinder
npm create vite@latest . -- --template react-ts
```

When prompted about existing files, select "Ignore files and continue"

Expected: Project scaffolded with React + TypeScript

**Step 2: Install dependencies**

Run:
```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npm install @tanstack/react-query axios react-router-dom
npm install -D @types/react-router-dom
npx tailwindcss init -p
```

Expected: All packages installed successfully

**Step 3: Configure Tailwind**

Replace `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 4: Configure Tailwind CSS imports**

Replace `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-900 text-white;
}
```

**Step 5: Verify setup works**

Run:
```bash
npm run dev
```

Expected: Dev server starts, app loads at http://localhost:5173

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: initialize Vite + React + TypeScript + Tailwind project"
```

---

## Task 2: Router and Page Structure

**Files:**
- Create: `src/pages/Home.tsx`
- Create: `src/pages/Search.tsx`
- Create: `src/pages/TitleDetail.tsx`
- Modify: `src/App.tsx`

**Step 1: Create Home page placeholder**

Create `src/pages/Home.tsx`:
```tsx
export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">StreamFinder</h1>
      <p className="text-gray-400 mt-2">Find where to watch your favorite movies and shows</p>
    </div>
  );
}
```

**Step 2: Create Search page placeholder**

Create `src/pages/Search.tsx`:
```tsx
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
```

**Step 3: Create TitleDetail page placeholder**

Create `src/pages/TitleDetail.tsx`:
```tsx
import { useParams } from 'react-router-dom';

export default function TitleDetail() {
  const { type, id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Title Detail</h1>
      <p className="text-gray-400">Type: {type}, ID: {id}</p>
    </div>
  );
}
```

**Step 4: Set up router in App.tsx**

Replace `src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Search from './pages/Search';
import TitleDetail from './pages/TitleDetail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/title/:type/:id" element={<TitleDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

**Step 5: Verify routing works**

Run:
```bash
npm run dev
```

Test manually:
- http://localhost:5173/ shows Home
- http://localhost:5173/search?q=test shows Search
- http://localhost:5173/title/movie/123 shows TitleDetail

Expected: All three routes render correctly

**Step 6: Commit**

```bash
git add src/pages src/App.tsx
git commit -m "feat: add router with Home, Search, and TitleDetail pages"
```

---

## Task 3: JustWatch API Service

**Files:**
- Create: `src/services/justwatch.ts`
- Create: `src/types/justwatch.ts`

**Step 1: Create TypeScript types**

Create `src/types/justwatch.ts`:
```tsx
export interface Provider {
  id: number;
  short_name: string;
  clear_name: string;
  icon_url: string;
}

export interface Offer {
  provider_id: number;
  monetization_type: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads';
  presentation_type: string;
  urls: {
    standard_web: string;
  };
  retail_price?: number;
  currency?: string;
}

export interface Title {
  id: number;
  title: string;
  original_title: string;
  poster: string;
  object_type: 'movie' | 'show';
  original_release_year: number;
  short_description?: string;
  offers?: Offer[];
  scoring?: {
    imdb_score?: number;
  }[];
}

export interface SearchResponse {
  items: Title[];
  total_results: number;
}
```

**Step 2: Create JustWatch API service**

Create `src/services/justwatch.ts`:
```tsx
import axios from 'axios';
import type { SearchResponse, Title, Provider } from '../types/justwatch';

// Using a CORS proxy for development
// In production, you'd use your own backend
const CORS_PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://apis.justwatch.com/content';

const api = axios.create({
  baseURL: CORS_PROXY + encodeURIComponent(BASE_URL),
});

export async function searchTitles(query: string, providers?: number[]): Promise<Title[]> {
  const body = {
    query,
    content_types: ['movie', 'show'],
    page: 1,
    page_size: 20,
    providers: providers,
  };

  const response = await api.post<SearchResponse>(
    `/${encodeURIComponent('titles/en_US/popular')}`,
    body
  );

  return response.data.items || [];
}

export async function getPopular(providers?: number[]): Promise<Title[]> {
  const body = {
    content_types: ['movie', 'show'],
    page: 1,
    page_size: 20,
    providers: providers,
  };

  const response = await api.post<SearchResponse>(
    `/${encodeURIComponent('titles/en_US/popular')}`,
    body
  );

  return response.data.items || [];
}

export async function getTitleDetails(type: 'movie' | 'show', id: number): Promise<Title> {
  const response = await api.get<Title>(
    `/${encodeURIComponent(`titles/${type}/${id}/locale/en_US`)}`
  );

  return response.data;
}

export async function getProviders(): Promise<Provider[]> {
  const response = await api.get<Provider[]>(
    `/${encodeURIComponent('providers/locale/en_US')}`
  );

  return response.data;
}

// Common US streaming providers with their JustWatch IDs
export const POPULAR_PROVIDERS: Provider[] = [
  { id: 8, short_name: 'nfx', clear_name: 'Netflix', icon_url: '' },
  { id: 9, short_name: 'amp', clear_name: 'Amazon Prime Video', icon_url: '' },
  { id: 337, short_name: 'dnp', clear_name: 'Disney+', icon_url: '' },
  { id: 15, short_name: 'hlu', clear_name: 'Hulu', icon_url: '' },
  { id: 1899, short_name: 'max', clear_name: 'Max', icon_url: '' },
  { id: 386, short_name: 'pck', clear_name: 'Peacock', icon_url: '' },
  { id: 531, short_name: 'pmp', clear_name: 'Paramount+', icon_url: '' },
  { id: 350, short_name: 'atp', clear_name: 'Apple TV+', icon_url: '' },
];
```

**Step 3: Test API in browser console**

Run:
```bash
npm run dev
```

Open browser console and test:
```javascript
// Import won't work in console, but verify no build errors
```

Expected: No TypeScript or build errors

**Step 4: Commit**

```bash
git add src/services src/types
git commit -m "feat: add JustWatch API service and types"
```

---

## Task 4: Service Selector Component

**Files:**
- Create: `src/components/ServiceSelector.tsx`
- Create: `src/hooks/useServices.ts`

**Step 1: Create useServices hook for local storage**

Create `src/hooks/useServices.ts`:
```tsx
import { useState, useEffect } from 'react';
import { POPULAR_PROVIDERS } from '../services/justwatch';
import type { Provider } from '../types/justwatch';

const STORAGE_KEY = 'streamfinder-services';

export function useServices() {
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const isSelected = (id: number) => selectedIds.includes(id);

  const selectedProviders: Provider[] = POPULAR_PROVIDERS.filter((p) =>
    selectedIds.includes(p.id)
  );

  return {
    providers: POPULAR_PROVIDERS,
    selectedIds,
    selectedProviders,
    toggle,
    isSelected,
  };
}
```

**Step 2: Create ServiceSelector component**

Create `src/components/ServiceSelector.tsx`:
```tsx
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
```

**Step 3: Add to Home page**

Update `src/pages/Home.tsx`:
```tsx
import ServiceSelector from '../components/ServiceSelector';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">StreamFinder</h1>
      <p className="text-gray-400 mb-6">Find where to watch your favorite movies and shows</p>

      <ServiceSelector />
    </div>
  );
}
```

**Step 4: Verify service selection persists**

Run:
```bash
npm run dev
```

Test manually:
1. Click several service buttons
2. Refresh the page
3. Selections should persist

Expected: Service selections persist across page refreshes

**Step 5: Commit**

```bash
git add src/components src/hooks src/pages/Home.tsx
git commit -m "feat: add service selector with local storage persistence"
```

---

## Task 5: Search Bar Component

**Files:**
- Create: `src/components/SearchBar.tsx`
- Modify: `src/pages/Home.tsx`

**Step 1: Create SearchBar component**

Create `src/components/SearchBar.tsx`:
```tsx
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies and TV shows..."
          className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </form>
  );
}
```

**Step 2: Add SearchBar to Home page**

Update `src/pages/Home.tsx`:
```tsx
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
```

**Step 3: Verify search navigates correctly**

Run:
```bash
npm run dev
```

Test manually:
1. Type "the office" in search bar
2. Press Enter
3. Should navigate to /search?q=the%20office

Expected: Search navigates to Search page with query parameter

**Step 4: Commit**

```bash
git add src/components/SearchBar.tsx src/pages/Home.tsx
git commit -m "feat: add search bar component with navigation"
```

---

## Task 6: Content Card Component

**Files:**
- Create: `src/components/ContentCard.tsx`
- Create: `src/components/ServiceBadge.tsx`

**Step 1: Create ServiceBadge component**

Create `src/components/ServiceBadge.tsx`:
```tsx
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
```

**Step 2: Create ContentCard component**

Create `src/components/ContentCard.tsx`:
```tsx
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
```

**Step 3: Commit**

```bash
git add src/components/ContentCard.tsx src/components/ServiceBadge.tsx
git commit -m "feat: add ContentCard and ServiceBadge components"
```

---

## Task 7: Search Page with API Integration

**Files:**
- Create: `src/hooks/useSearch.ts`
- Modify: `src/pages/Search.tsx`

**Step 1: Create useSearch hook**

Create `src/hooks/useSearch.ts`:
```tsx
import { useQuery } from '@tanstack/react-query';
import { searchTitles } from '../services/justwatch';

export function useSearch(query: string, providerIds?: number[]) {
  return useQuery({
    queryKey: ['search', query, providerIds],
    queryFn: () => searchTitles(query, providerIds),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

**Step 2: Update Search page with API integration**

Replace `src/pages/Search.tsx`:
```tsx
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
```

**Step 3: Verify search works**

Run:
```bash
npm run dev
```

Test manually:
1. Go to home page, select some services
2. Search for "the office"
3. Should see results with poster images and service badges

Expected: Search results display with images and service indicators

**Step 4: Commit**

```bash
git add src/hooks/useSearch.ts src/pages/Search.tsx
git commit -m "feat: implement search page with JustWatch API integration"
```

---

## Task 8: Title Detail Page

**Files:**
- Create: `src/hooks/useTitleDetail.ts`
- Modify: `src/pages/TitleDetail.tsx`

**Step 1: Create useTitleDetail hook**

Create `src/hooks/useTitleDetail.ts`:
```tsx
import { useQuery } from '@tanstack/react-query';
import { getTitleDetails } from '../services/justwatch';

export function useTitleDetail(type: 'movie' | 'show', id: number) {
  return useQuery({
    queryKey: ['title', type, id],
    queryFn: () => getTitleDetails(type, id),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
```

**Step 2: Update TitleDetail page**

Replace `src/pages/TitleDetail.tsx`:
```tsx
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
```

**Step 3: Verify title detail page works**

Run:
```bash
npm run dev
```

Test manually:
1. Search for a movie
2. Click on a result
3. Should see detail page with poster, info, and streaming links

Expected: Title detail page shows all information and working links

**Step 4: Commit**

```bash
git add src/hooks/useTitleDetail.ts src/pages/TitleDetail.tsx
git commit -m "feat: implement title detail page with streaming links"
```

---

## Task 9: Home Page with Trending Content

**Files:**
- Create: `src/hooks/usePopular.ts`
- Create: `src/components/ContentRow.tsx`
- Modify: `src/pages/Home.tsx`

**Step 1: Create usePopular hook**

Create `src/hooks/usePopular.ts`:
```tsx
import { useQuery } from '@tanstack/react-query';
import { getPopular } from '../services/justwatch';

export function usePopular(providerIds?: number[]) {
  return useQuery({
    queryKey: ['popular', providerIds],
    queryFn: () => getPopular(providerIds),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
```

**Step 2: Create ContentRow component**

Create `src/components/ContentRow.tsx`:
```tsx
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
```

**Step 3: Update Home page with trending content**

Replace `src/pages/Home.tsx`:
```tsx
import ServiceSelector from '../components/ServiceSelector';
import SearchBar from '../components/SearchBar';
import ContentRow from '../components/ContentRow';
import { useServices } from '../hooks/useServices';
import { usePopular } from '../hooks/usePopular';

export default function Home() {
  const { selectedIds } = useServices();
  const { data: popular, isLoading } = usePopular(
    selectedIds.length > 0 ? selectedIds : undefined
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">StreamFinder</h1>
      <p className="text-gray-400 mb-6">Find where to watch your favorite movies and shows</p>

      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="mb-8">
        <ServiceSelector />
      </div>

      {isLoading && (
        <div className="text-gray-400">Loading trending content...</div>
      )}

      {popular && (
        <>
          <ContentRow
            title="Trending Now"
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

      {selectedIds.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">
          Select your streaming services above to see what's available on them.
        </p>
      )}
    </div>
  );
}
```

**Step 4: Verify home page shows trending content**

Run:
```bash
npm run dev
```

Test manually:
1. Load home page
2. Should see trending movies and TV shows
3. Select services to filter content

Expected: Home page displays trending content rows

**Step 5: Commit**

```bash
git add src/hooks/usePopular.ts src/components/ContentRow.tsx src/pages/Home.tsx
git commit -m "feat: add trending content rows to home page"
```

---

## Task 10: Watchlist Feature

**Files:**
- Create: `src/hooks/useWatchlist.ts`
- Create: `src/pages/Watchlist.tsx`
- Modify: `src/pages/TitleDetail.tsx`
- Modify: `src/App.tsx`

**Step 1: Create useWatchlist hook**

Create `src/hooks/useWatchlist.ts`:
```tsx
import { useState, useEffect, useCallback } from 'react';
import type { Title } from '../types/justwatch';

const STORAGE_KEY = 'streamfinder-watchlist';

interface WatchlistItem {
  id: number;
  type: 'movie' | 'show';
  title: string;
  poster: string | null;
  year: number;
  addedAt: number;
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((title: Title) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === title.id && i.type === title.object_type);
      if (exists) return prev;

      return [
        ...prev,
        {
          id: title.id,
          type: title.object_type,
          title: title.title,
          poster: title.poster,
          year: title.original_release_year,
          addedAt: Date.now(),
        },
      ];
    });
  }, []);

  const remove = useCallback((id: number, type: 'movie' | 'show') => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  }, []);

  const isInWatchlist = useCallback(
    (id: number, type: 'movie' | 'show') => {
      return items.some((i) => i.id === id && i.type === type);
    },
    [items]
  );

  return { items, add, remove, isInWatchlist };
}
```

**Step 2: Create Watchlist page**

Create `src/pages/Watchlist.tsx`:
```tsx
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
```

**Step 3: Add Watchlist route to App.tsx**

Update `src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Search from './pages/Search';
import TitleDetail from './pages/TitleDetail';
import Watchlist from './pages/Watchlist';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/title/:type/:id" element={<TitleDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

**Step 4: Add watchlist button to TitleDetail page**

Update `src/pages/TitleDetail.tsx` - add after the imports:
```tsx
import { useWatchlist } from '../hooks/useWatchlist';
```

And inside the component, after `const { selectedIds } = useServices();`:
```tsx
const { add, remove, isInWatchlist } = useWatchlist();
```

Add this button after the streaming/rent-buy sections (before the closing `</div>` of the details section):
```tsx
          {/* Watchlist Button */}
          <div className="mt-6">
            {isInWatchlist(title.id, title.object_type) ? (
              <button
                onClick={() => remove(title.id, title.object_type)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                ✓ In Watchlist - Remove
              </button>
            ) : (
              <button
                onClick={() => add(title)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
              >
                + Add to Watchlist
              </button>
            )}
          </div>
```

**Step 5: Add watchlist link to Home page**

Update `src/pages/Home.tsx` - add after the title:
```tsx
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">StreamFinder</h1>
        <Link to="/watchlist" className="text-blue-400 hover:text-blue-300">
          My Watchlist
        </Link>
      </div>
```

And add the import at the top:
```tsx
import { Link } from 'react-router-dom';
```

**Step 6: Verify watchlist works**

Run:
```bash
npm run dev
```

Test manually:
1. Go to a title detail page
2. Click "Add to Watchlist"
3. Go to Watchlist page
4. Item should appear
5. Refresh - item should persist

Expected: Watchlist functionality works with local storage persistence

**Step 7: Commit**

```bash
git add src/hooks/useWatchlist.ts src/pages/Watchlist.tsx src/pages/TitleDetail.tsx src/pages/Home.tsx src/App.tsx
git commit -m "feat: add watchlist feature with local storage"
```

---

## Task 11: Final Polish and README

**Files:**
- Modify: `src/pages/Home.tsx` (final layout tweaks)
- Create: `README.md`

**Step 1: Final Home page polish**

Ensure `src/pages/Home.tsx` has the complete final version:
```tsx
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
```

**Step 2: Create README**

Create `README.md`:
```markdown
# StreamFinder

A web app that helps you find where to watch movies and TV shows across your streaming services.

## Features

- **Search** - Find any movie or TV show and see which streaming services have it
- **Browse** - See trending content filtered to your selected services
- **Watchlist** - Save titles for later (stored locally)
- **Service Filter** - Select which streaming services you have

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Query
- JustWatch API (unofficial)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  components/     # Reusable UI components
  hooks/          # Custom React hooks
  pages/          # Route pages
  services/       # API integrations
  types/          # TypeScript types
```

## Roadmap

- [ ] Phase 2: Port to Fire TV with native Android
- [ ] Phase 3: User accounts, cloud sync, premium features

## Notes

This prototype uses an unofficial JustWatch API via CORS proxy. For production, you would want to:
1. Use a backend proxy to avoid CORS issues
2. Consider a paid streaming availability API
3. Add proper error handling and rate limiting
```

**Step 3: Commit**

```bash
git add src/pages/Home.tsx README.md
git commit -m "docs: add README and final polish"
```

**Step 4: Push to GitHub**

```bash
git push -u origin main
```

---

## Summary

After completing all tasks, you will have:

1. ✅ Project setup with React + TypeScript + Tailwind
2. ✅ Router with Home, Search, TitleDetail, and Watchlist pages
3. ✅ JustWatch API integration for search and browse
4. ✅ Service selector with local storage persistence
5. ✅ Search functionality with results grid
6. ✅ Content cards with service badges
7. ✅ Title detail page with streaming links
8. ✅ Home page with trending content rows
9. ✅ Watchlist feature with local storage
10. ✅ README documentation

**MVP Success Criteria Met:**
- ✅ Can search for any movie/show and see which services have it
- ✅ Can browse trending content filtered to selected services
- ✅ Can click through to watch on streaming services
- ✅ Can save titles to a watchlist

**Next Phase:** Port to Fire TV with native Android development.
