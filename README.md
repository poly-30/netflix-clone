# 🎬 Netflix Clone (React 19 + Vite + HLS Streaming)

A modern, high-performance Netflix streaming web client featuring seamless HLS video playback, dynamic catalog browsing, TMDB API integration, and self-hosted Jellyfin media server connectivity.

![Netflix Clone Preview](src/assets/hero.png)

---

## ✨ Features

- **Cinematic UI & Experience**:
  - Auto-playing billboard hero banner with mute/unmute audio control.
  - Category carousels with smooth horizontal scrolling and hover expand cards.
  - Instant modal previews with high-res backdrops, genre tags, maturity ratings, and match percentages.
- **Advanced Video Streaming Player**:
  - Built-in **HLS.js** player for adaptive bitrate streaming (`.m3u8` and `.mp4`).
  - Custom Netflix-style player controls: play/pause, scrub bar, volume, playback speed (0.5x – 2x), subtitle/audio track toggles, picture-in-picture, and full-screen support.
  - Keyboard shortcuts (`Space` for play/pause, `M` to mute, `F` for full screen, `Esc` to exit).
- **TMDB API Integration**:
  - Connect your free [TMDB API key](https://www.themoviedb.org/) to fetch real Netflix Originals, trending titles, and movies.
  - Direct deep linking to official Netflix watch pages.
- **Jellyfin / Personal Media Server Streaming**:
  - Connect your self-hosted Jellyfin server to stream your personal home media library within the Netflix UI.
  - Automatic HLS transcoding and direct play fallback support.
  - Built-in sample personal media library so the feature works immediately out of the box.
- **Watchlist & Likes**:
  - Add titles to "My List" with persistent `localStorage` synchronization.
  - Like/upvote titles with dynamic badges.
- **Instant Search & Filter**:
  - Live filtering across titles, genres, overviews, and cast members.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite](https://vite.dev/)
- **Streaming Engine**: [HLS.js](https://github.com/video-dev/hls.js/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Responsive, Dark Mode, Netflix Design System)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/poly-30/netflix-clone.git
   cd netflix-clone
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## ⚙️ Configuration & Integrations

Click the **Settings** (gear icon) in the navigation bar to configure integrations:

### 1. The Movie Database (TMDB) API
- Get a free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api).
- Enter your API key in Settings to unlock live Netflix Originals, weekly trending shows, and movies.

### 2. Jellyfin Media Server
- Enter your Jellyfin server URL (e.g. `http://localhost:8096` or your remote domain) and API token.
- Once connected, your personal server movies and series appear in the "Personal Media Library" row.

---

## 📁 Project Structure

```text
netflix-clone/
├── public/               # Static assets & SVG icons
├── src/
│   ├── assets/           # UI media & hero images
│   ├── components/       # Modular React components
│   │   ├── Billboard.jsx         # Hero showcase banner
│   │   ├── MovieDetailModal.jsx  # Detailed title modal
│   │   ├── MovieRow.jsx          # Category slider row
│   │   ├── Navbar.jsx            # Fixed blurred top navigation
│   │   ├── SettingsModal.jsx     # TMDB & Jellyfin configuration
│   │   └── VideoPlayer.jsx       # Custom HLS video player
│   ├── data/
│   │   └── movies.js             # Curated offline catalog & demo streams
│   ├── services/
│   │   ├── jellyfin.js           # Jellyfin API client
│   │   └── tmdb.js               # TMDB API client
│   ├── App.css           # App layout styling
│   ├── App.jsx           # Main state & view orchestration
│   ├── index.css         # Global styles & design tokens
│   └── main.jsx          # Entrypoint
├── package.json
└── vite.config.js
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
