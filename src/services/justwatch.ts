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
