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
