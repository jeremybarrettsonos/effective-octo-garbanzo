import axios from 'axios';
import type { Title, Provider } from '../types/justwatch';

// JustWatch GraphQL API
// Using a CORS proxy for browser requests
const CORS_PROXY = 'https://corsproxy.io/?';
const GRAPHQL_URL = 'https://apis.justwatch.com/graphql';

const api = axios.create({
  baseURL: CORS_PROXY + encodeURIComponent(GRAPHQL_URL),
  headers: {
    'Content-Type': 'application/json',
  },
});

// GraphQL query for popular titles
const POPULAR_QUERY = `
query GetPopularTitles($country: Country!, $first: Int!, $filter: TitleFilter) {
  popularTitles(country: $country, first: $first, filter: $filter) {
    edges {
      node {
        id
        objectType
        objectId
        content(country: $country, language: en) {
          title
          originalReleaseYear
          shortDescription
          posterUrl(profile: S166, format: JPG)
        }
        offers(country: $country, platform: WEB) {
          monetizationType
          standardWebURL
          retailPrice(language: en)
          package {
            packageId
            clearName
          }
        }
      }
    }
  }
}`;

// GraphQL query for search
const SEARCH_QUERY = `
query SearchTitles($country: Country!, $searchTitlesFilter: TitleFilter!, $first: Int!) {
  popularTitles(country: $country, filter: $searchTitlesFilter, first: $first) {
    edges {
      node {
        id
        objectType
        objectId
        content(country: $country, language: en) {
          title
          originalReleaseYear
          shortDescription
          posterUrl(profile: S166, format: JPG)
        }
        offers(country: $country, platform: WEB) {
          monetizationType
          standardWebURL
          retailPrice(language: en)
          package {
            packageId
            clearName
          }
        }
      }
    }
  }
}`;

// GraphQL query for title details
const TITLE_DETAIL_QUERY = `
query GetTitle($nodeId: ID!, $country: Country!) {
  node(id: $nodeId) {
    ... on MovieOrShow {
      id
      objectType
      objectId
      content(country: $country, language: en) {
        title
        originalReleaseYear
        shortDescription
        posterUrl(profile: S332, format: JPG)
        scoring {
          imdbScore
        }
      }
      offers(country: $country, platform: WEB) {
        monetizationType
        standardWebURL
        retailPrice(language: en)
        package {
          packageId
          clearName
        }
      }
    }
  }
}`;

interface GraphQLNode {
  id: string;
  objectType: 'MOVIE' | 'SHOW';
  objectId: number;
  content: {
    title: string;
    originalReleaseYear: number;
    shortDescription?: string;
    posterUrl?: string;
    scoring?: {
      imdbScore?: number;
    };
  };
  offers?: {
    monetizationType: string;
    standardWebURL: string;
    retailPrice?: string;
    package: {
      packageId: number;
      clearName: string;
    };
  }[];
}

// Transform GraphQL response to our Title interface
function transformNode(node: GraphQLNode): Title {
  return {
    id: node.objectId,
    title: node.content.title,
    original_title: node.content.title,
    poster: node.content.posterUrl || '',
    object_type: node.objectType.toLowerCase() as 'movie' | 'show',
    original_release_year: node.content.originalReleaseYear,
    short_description: node.content.shortDescription,
    offers: (node.offers || []).map((offer) => ({
      provider_id: offer.package.packageId,
      monetization_type: offer.monetizationType.toLowerCase() as 'flatrate' | 'rent' | 'buy' | 'free' | 'ads',
      presentation_type: 'hd',
      urls: {
        standard_web: offer.standardWebURL,
      },
      retail_price: offer.retailPrice ? parseFloat(offer.retailPrice) : undefined,
    })),
    scoring: node.content.scoring ? [{ imdb_score: node.content.scoring.imdbScore }] : undefined,
  };
}

export async function searchTitles(query: string, providers?: number[]): Promise<Title[]> {
  const filter: Record<string, unknown> = {
    searchQuery: query,
  };

  if (providers && providers.length > 0) {
    filter.packages = providers.map(String);
  }

  const response = await api.post('', {
    query: SEARCH_QUERY,
    variables: {
      country: 'US',
      first: 20,
      searchTitlesFilter: filter,
    },
  });

  const edges = response.data?.data?.popularTitles?.edges || [];
  return edges.map((edge: { node: GraphQLNode }) => transformNode(edge.node));
}

export async function getPopular(providers?: number[]): Promise<Title[]> {
  const filter: Record<string, unknown> = {};

  if (providers && providers.length > 0) {
    filter.packages = providers.map(String);
  }

  const response = await api.post('', {
    query: POPULAR_QUERY,
    variables: {
      country: 'US',
      first: 20,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    },
  });

  const edges = response.data?.data?.popularTitles?.edges || [];
  return edges.map((edge: { node: GraphQLNode }) => transformNode(edge.node));
}

export async function getTitleDetails(type: 'movie' | 'show', id: number): Promise<Title> {
  const nodeId = type === 'movie' ? `tm${id}` : `ts${id}`;

  const response = await api.post('', {
    query: TITLE_DETAIL_QUERY,
    variables: {
      nodeId,
      country: 'US',
    },
  });

  const node = response.data?.data?.node;
  if (!node) {
    throw new Error('Title not found');
  }

  return transformNode(node);
}

export async function getProviders(): Promise<Provider[]> {
  // Return static list since the GraphQL API requires different handling for providers
  return POPULAR_PROVIDERS;
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
