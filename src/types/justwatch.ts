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
