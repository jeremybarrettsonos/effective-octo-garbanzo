# StreamFinder Design Document

**Date:** 2026-01-31
**Status:** Approved for implementation

## Overview

StreamFinder is a Fire TV app that aggregates viewing options from streaming services installed on the user's device. It provides unified search ("where can I watch X?") and browse ("what's available across my services?") functionality.

## Strategy: Phased Approach

Given this is a first app project, we'll build in three phases:

### Phase 1 - Web Prototype (Current Focus)
- React web app to validate the concept
- JustWatch API integration for content data
- Search and browse functionality
- Local watchlist storage
- No accounts, no monetization

### Phase 2 - Fire TV Port
- Port validated concept to native Android/Fire TV
- Dynamic detection of installed streaming apps
- Deep linking to streaming services
- D-pad navigation and 10-foot UI
- Ad integration (free tier)

### Phase 3 - Premium & Polish
- User accounts and cloud sync
- Family sharing for watchlists
- Notifications for content arriving/leaving
- Personalized recommendations
- Amazon Appstore release

## Technical Architecture (Web Prototype)

### Tech Stack
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for API data fetching and caching
- **Local Storage** for watchlist persistence

### Project Structure
```
/src
  /components
    SearchBar.tsx        # Main search input
    ContentGrid.tsx      # Grid of movie/show cards
    ContentCard.tsx      # Individual title card
    ServiceBadge.tsx     # Shows which services have the title
    FilterBar.tsx        # Filter by service, type, genre
  /pages
    Home.tsx             # Featured content + search
    SearchResults.tsx    # Search results page
    TitleDetail.tsx      # Details for a specific movie/show
  /services
    justwatch.ts         # API integration
  /hooks
    useSearch.ts         # Search logic
    useWatchlist.ts      # Local watchlist management
```

### Data Flow
1. User searches or browses → React Query calls JustWatch API
2. Results filtered by selected services → Display in grid
3. User clicks title → Show detail page with "Watch on [Service]" buttons
4. "Watch on" buttons link to streaming service URLs

## JustWatch API Integration

Using the unofficial JustWatch API for the prototype:

**Base URL:** `https://apis.justwatch.com/content`

**Key Endpoints:**
- `GET /titles/en_US/popular` - Search and browse titles
- `GET /titles/movie/{id}/locale/en_US` - Movie details
- `GET /titles/show/{id}/locale/en_US` - TV show details
- `GET /providers/locale/en_US` - List of streaming providers

**Response Data:**
- Title info (name, year, poster, description)
- `offers[]` array showing which services have it
- Offer types: stream, rent, buy
- Direct URLs to watch on each service

**Note:** This is unofficial and could change. Abstract behind a service layer to allow swapping to a paid API for production.

## UI/UX Design

### Home Screen
```
┌─────────────────────────────────────────────────┐
│  StreamFinder               [Search...........] │
├─────────────────────────────────────────────────┤
│  My Services: [Netflix] [Hulu] [Disney+] [+]    │
├─────────────────────────────────────────────────┤
│  Trending Now                                   │
│  [Card] [Card] [Card] [Card] [Card] →           │
│  New on Netflix                                 │
│  [Card] [Card] [Card] [Card] [Card] →           │
│  New on Disney+                                 │
│  [Card] [Card] [Card] ...                       │
└─────────────────────────────────────────────────┘
```

### Content Cards
- Poster image
- Title and year
- Small service icons showing availability

### Title Detail Page
- Large poster
- Title, year, rating, description
- "Watch On" buttons for each available service
- "Add to Watchlist" button

## MVP Scope

### In Scope
- Home page with service selector and trending content rows
- Search with results grid
- Title detail page with "Watch On" links
- Filter by: service, content type (movie/TV)
- Local watchlist (add/remove, persisted to localStorage)
- Responsive design

### Out of Scope (Phase 1)
- User accounts / authentication
- Cloud sync for watchlist
- Notifications
- Advanced recommendations
- Genre filtering
- "Leaving soon" alerts
- Social features / sharing
- Ads

## Success Criteria

1. Can search for any movie/show and see which of my services has it
2. Can browse trending content filtered to my services
3. Can click through to watch on the correct streaming service
4. Can save titles to a watchlist for later

## Monetization (Future)

**Freemium model:**
- **Free tier:** Basic search, browse, local watchlist, with ads
- **Premium tier:** Watchlist sync, family sharing, notifications, advanced filters, personalized recommendations, ad-free

## Risks

| Risk | Mitigation |
|------|------------|
| JustWatch API changes | Abstract behind service layer; be ready to swap to paid API |
| Scope creep | Stick to MVP list ruthlessly |
| CORS issues | Use proxy or serverless function |

## Getting Started

### Prerequisites
- Node.js v18+
- VS Code (recommended)
- Git

### Setup
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install tailwindcss @tanstack/react-query axios
npx tailwindcss init -p
```

## Implementation Milestones

1. Project setup + basic routing
2. JustWatch API integration working
3. Service selector + local storage
4. Search page functional
5. Home page with content rows
6. Title detail page
7. Watchlist feature
8. Polish and testing
