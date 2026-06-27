# StockSense v2

A production-grade Indian stock market platform with real-time data, AI insights, portfolio simulation, and market news.

## Features

- **Live Market Data** — Real-time prices via Finnhub API (15s refresh, server-side caching)
- **AI Financial Assistant** — Streaming chat powered by Groq (Llama 3.1 70B)
- **AI Prediction Chart** — Technical analysis (SMA, RSI) with 7-day price forecast
- **Portfolio Simulator** — ₹5,00,000 virtual cash, buy/sell stocks, track P&L in real time
- **Market News** — AI sentiment analysis on live news articles
- **Financial Glossary** — 18+ searchable investing terms with examples
- **Broker Directory** — Curated list of Indian stockbrokers
- **Authentication** — Email/password + Google OAuth, protected routes
- **Admin Dashboard** — User management, broker editing, platform analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + Framer Motion |
| UI | Radix UI primitives |
| Charts | Recharts |
| Database | PostgreSQL (Prisma ORM) |
| Auth | NextAuth v5 (JWT + Google OAuth) |
| AI | Groq (llama-3.1-70b) |
| Market Data | Finnhub API |
| News | NewsAPI |
| State | TanStack Query + Zustand |

---

## Pages

| Route | Description |
|---|---|
| `/` | Home dashboard — indices, movers, portfolio summary, news |
| `/market` | Market overview with sector heatmap |
| `/stocks` | Stock browser with live prices and sorting |
| `/recently-viewed` | Stocks you've viewed recently |
| `/portfolio` | Virtual portfolio with ₹5L starting balance |
| `/glossary` | Financial terms dictionary |
| `/news` | Market news with sentiment analysis |
| `/ask-ai` | AI financial assistant (Groq streaming) |
| `/buy` | Broker directory |
| `/stock/[ticker]` | Stock detail — chart, stats, trade, AI prediction |
| `/profile` | Edit name, change password |
| `/settings` | Theme, exchange, currency, notification preferences |
| `/admin` | Admin dashboard (admin role only) |
| `/login` | Sign in with email or Google |
| `/signup` | Register a new account |
| `/forgot-password` | Request a password reset link |

---

## Setup

### 1. Install dependencies

```bash
cd stocksense
npm install
```

### 2. Get API keys

| Service | URL | Free Tier |
|---|---|---|
| Finnhub (stock data) | https://finnhub.io | 60 calls/min |
| Groq (AI chat) | https://console.groq.com | Generous free tier |
| NewsAPI (market news) | https://newsapi.org | 100 req/day |
| Neon (PostgreSQL) | https://neon.tech | 512MB free |

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
FINNHUB_API_KEY="your-key"
GROQ_API_KEY="your-key"
NEWS_API_KEY="your-key"
```

### 4. Database setup

```bash
# Push schema
npm run db:push

# Seed glossary terms and brokers
npm run db:seed
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
stocksense/
├── app/
│   ├── (auth)/            # Public auth pages
│   ├── (dashboard)/       # Protected app pages
│   ├── api/               # API routes
│   └── stock/[ticker]/    # Dynamic stock detail
├── components/
│   ├── layout/            # Navbar, Sidebar, Providers
│   ├── market/            # Indices, TopMovers, SectorHeatmap
│   ├── stocks/            # StockHeader, StockChart, StockBrowser
│   ├── portfolio/         # Dashboard, TradePanel, Summary
│   ├── charts/            # Stock, AI prediction, Market overview
│   ├── news/              # Feed, Preview
│   ├── ai/                # ChatInterface
│   ├── glossary/          # GlossaryGrid
│   ├── brokers/           # BrokersGrid
│   ├── profile/           # ProfileForm
│   ├── settings/          # SettingsForm
│   ├── admin/             # AdminDashboard
│   └── ui/                # Skeleton, Toaster
├── features/auth/         # Login, Signup, ForgotPassword forms
├── services/              # Stock, AI, News business logic
├── lib/                   # Prisma client, utils, validations
├── hooks/                 # useDebounce
├── prisma/                # Schema + seed
└── middleware.ts          # Auth route protection
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/stocks/[ticker]/quote` | Live stock quote |
| GET | `/api/stocks/[ticker]/candles` | Historical OHLCV data |
| GET | `/api/market/indices` | Nifty, Sensex, Bank Nifty |
| GET | `/api/market/movers` | Top gainers/losers/active |
| GET | `/api/search?q=` | Stock symbol search |
| GET | `/api/news` | Market news with sentiment |
| POST | `/api/ai/chat` | Streaming AI chat |
| GET/POST | `/api/ai/sessions` | Chat session management |
| POST | `/api/portfolio/trade` | Buy or sell stocks |
| GET/POST/DELETE | `/api/watchlist` | Watchlist management |
| GET/DELETE | `/api/recently-viewed` | Recently viewed stocks |
| GET | `/api/glossary` | Glossary terms |
| GET | `/api/brokers` | Broker listings |
| PUT | `/api/user/profile` | Update display name |
| PUT | `/api/user/password` | Change password |
| GET/PUT | `/api/user/preferences` | User preferences |
| GET | `/api/admin/stats` | Platform stats (admin) |
| GET | `/api/admin/users` | User list (admin) |

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Set all environment variables in the Vercel dashboard.
The `vercel.json` is pre-configured with build settings and region (sin1).

## Making a user Admin

Via Prisma Studio: `npm run db:studio`

Or via SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Notes

- **Finnhub Indian stocks** use `.NS` suffix (NSE) — e.g., `RELIANCE.NS`, `TCS.NS`
- **NewsAPI free tier** only works on localhost. For production, use a paid plan
- **Groq** has a generous free tier with no credit card required
- Server-side caching: 15s for prices, 60s for candles, 5min for news
