# ⬡ GitVerse — Explore Code as a Living Galaxy

Transform any GitHub profile into an immersive, interactive 3D galaxy.  
Repositories become planets. Stars become light. Commit history becomes motion.

---

## ✦ Features

- **3D Galaxy Visualization** — Each GitHub user's repos are rendered as an orbiting solar system
- **Space Probe Navigation** — Fly through the galaxy with keyboard/mouse controls
- **Planet Details** — Click any planet to scan repository metadata
- **Time Warp Mode** — Scrub through commit history and watch the galaxy evolve
- **Secure Architecture** — GitHub token never exposed to the browser
- **Production-Ready** — Optimized for Netlify, 60fps on mid-range hardware

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| 3D Engine | Three.js + React Three Fiber + Drei |
| Post Processing | @react-three/postprocessing |
| State | Zustand |
| Animation | Framer Motion |
| API | GitHub GraphQL v4 |
| Backend | Netlify Serverless Functions |
| Deployment | Netlify |

---

## ✦ Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/gitverse.git
cd gitverse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# GitHub Personal Access Token (server-side only)
GITHUB_TOKEN=ghp_your_token_here

# For local development with Netlify Functions
VITE_FUNCTIONS_BASE_URL=http://localhost:8888
```

### 4. Generate a GitHub Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Select scopes: `read:user`, `repo`, `read:org`
4. Copy the token into your `.env.local`

### 5. Start development server

**Option A — With Netlify Dev (recommended, runs functions locally):**

```bash
npm install -g netlify-cli
netlify dev
```

This starts both Vite (port 5173) and Netlify Functions (port 8888), proxied together.

**Option B — Vite only (UI only, no API):**

```bash
npm run dev
```

---

## ✦ Deploying to Netlify

### One-click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/gitverse)

### Manual Deploy

1. Push your repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Select your GitHub repo
4. Netlify auto-detects settings from `netlify.toml`
5. **Add environment variable:**
   - Key: `GITHUB_TOKEN`
   - Value: your GitHub Personal Access Token
6. Click **Deploy**

### Environment Variables (Netlify Dashboard)

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | ✅ Yes | GitHub Personal Access Token |
| `VITE_MAX_REPOS` | No | Max repos to fetch (default: 100) |
| `VITE_CACHE_TTL` | No | Client cache TTL in ms (default: 300000) |
| `VITE_DEBUG_MODE` | No | Enable debug overlays (default: false) |

---

## ✦ Project Structure

```
gitverse/
├── netlify/
│   └── functions/
│       └── github.ts          # Secure GitHub API proxy
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── hud/               # Phase 6: HUD overlays
│   │   ├── overlays/          # Error, scanning overlays
│   │   ├── probe/             # Phase 4: Space probe component
│   │   └── ui/                # Landing, Loading screens
│   ├── hooks/
│   │   ├── useAppStore.ts     # Global Zustand state
│   │   └── useGalaxyData.ts   # Data fetching hook
│   ├── scenes/
│   │   └── GalaxyScene.tsx    # Phase 3: Main 3D scene
│   ├── services/
│   │   └── github.ts          # Frontend API service
│   ├── types/
│   │   └── index.ts           # All TypeScript types
│   ├── utils/
│   │   ├── galaxyMapper.ts    # GitHub data → 3D config
│   │   └── formatters.ts      # Display formatters
│   ├── styles/
│   │   └── globals.css        # Design tokens + globals
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── netlify.toml
└── .env.example
```

---

## ✦ Data Mapping Logic

| GitHub Data | Visual Element |
|---|---|
| Repository | Planet |
| Stars | Glow intensity |
| Forks | Orbiting moons |
| Commit count | Planet size + surface complexity |
| Pull requests | Space stations |
| Issues | Asteroid belt |
| Primary language | Planet color + texture |
| Last push date | Activity ring color |

---

## ✦ Architecture: Secure API Flow

```
Browser (React)
     │
     ▼
/.netlify/functions/github
     │
     ├── In-memory cache check (5 min TTL)
     ├── Input sanitization
     ▼
GitHub GraphQL API
(GITHUB_TOKEN never leaves server)
     │
     ▼
Processed JSON → Browser
```

---

## ✦ Performance Targets

- 60fps on mid-range laptop
- < 3s initial load
- Handles 200+ repositories
- Instanced meshes for repeated geometry
- Lazy-loaded 3D scene
- Debounced expensive calculations

---

## ✦ Troubleshooting

**"GITHUB_TOKEN environment variable is not set"**  
→ Add your token to `.env.local` (dev) or Netlify environment variables (prod)

**"GitHub user not found"**  
→ Check the username is spelled correctly and the account is public

**"Rate limit exceeded"**  
→ The API allows 5,000 requests/hour with a token. Wait for reset or use a different token

**Functions not running locally**  
→ Make sure you're using `netlify dev` not `npm run dev`

**TypeScript errors in functions**  
→ Run `npm run type-check` — functions need Node 18+

---

## ✦ Roadmap

- [ ] Phase 3: Full 3D galaxy scene with planets, stars, atmosphere
- [ ] Phase 4: Space probe with keyboard navigation
- [ ] Phase 5: Time Warp timeline slider
- [ ] Phase 6: Sci-fi HUD overlay
- [ ] GitHub OAuth login for private repos
- [ ] Galaxy comparison (side-by-side users)
- [ ] Galaxy snapshot sharing
- [ ] Organization visualization
- [ ] Dark matter mode (activity heatmap)

---

## ✦ License

MIT — See [LICENSE](LICENSE)
