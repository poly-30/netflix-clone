import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Billboard from './components/Billboard';
import MovieRow from './components/MovieRow';
import MovieDetailModal from './components/MovieDetailModal';
import VideoPlayer from './components/VideoPlayer';
import SettingsModal from './components/SettingsModal';
import { CURATED_MOVIES, CATEGORIES } from './data/movies';
import { fetchFullNetflixCatalog } from './services/tmdb';
import {
  DEFAULT_JELLYFIN_CONFIG,
  SAMPLE_PERSONAL_LIBRARY,
  fetchJellyfinLibrary
} from './services/jellyfin';
import { Play, Plus, Check, HardDrive, Sparkles, ExternalLink } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalMovie, setSelectedModalMovie] = useState(null);
  const [activePlayingMovie, setActivePlayingMovie] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Local storage state
  const [myList, setMyList] = useState(() => {
    try {
      const saved = localStorage.getItem('netflix_my_list');
      return saved ? JSON.parse(saved) : [CURATED_MOVIES[0], CURATED_MOVIES[1]];
    } catch {
      return [CURATED_MOVIES[0]];
    }
  });

  const [likedMovies, setLikedMovies] = useState(() => {
    try {
      const saved = localStorage.getItem('netflix_liked');
      return saved ? JSON.parse(saved) : ['stranger-realms', 'cyber-neon-2099'];
    } catch {
      return [];
    }
  });

  const [tmdbApiKey, setTmdbApiKey] = useState(() => {
    return localStorage.getItem('netflix_tmdb_key') || '';
  });

  const [jellyfinConfig, setJellyfinConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('netflix_jellyfin_config');
      return saved ? JSON.parse(saved) : DEFAULT_JELLYFIN_CONFIG;
    } catch {
      return DEFAULT_JELLYFIN_CONFIG;
    }
  });

  const [moviesList, setMoviesList] = useState(CURATED_MOVIES);
  const [personalLibrary, setPersonalLibrary] = useState(SAMPLE_PERSONAL_LIBRARY);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('netflix_my_list', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    localStorage.setItem('netflix_liked', JSON.stringify(likedMovies));
  }, [likedMovies]);

  useEffect(() => {
    localStorage.setItem('netflix_jellyfin_config', JSON.stringify(jellyfinConfig));
  }, [jellyfinConfig]);

  // Load real Netflix catalog from TMDB if API key exists
  useEffect(() => {
    if (!tmdbApiKey) {
      setMoviesList(CURATED_MOVIES);
      return;
    }

    async function loadTmdbNetflix() {
      setIsLoadingCatalog(true);
      try {
        const catalog = await fetchFullNetflixCatalog(tmdbApiKey);
        if (catalog && catalog.all.length > 0) {
          // Merge TMDB Netflix titles with our curated streams
          setMoviesList([...catalog.all, ...CURATED_MOVIES]);
        }
      } catch (err) {
        console.warn('Failed to fetch full Netflix catalog:', err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }
    loadTmdbNetflix();
  }, [tmdbApiKey]);

  // Load Jellyfin items if configured
  useEffect(() => {
    if (!jellyfinConfig?.apiKey || !jellyfinConfig?.serverUrl) {
      setPersonalLibrary(SAMPLE_PERSONAL_LIBRARY);
      return;
    }

    async function loadJellyfin() {
      const items = await fetchJellyfinLibrary(jellyfinConfig.serverUrl, jellyfinConfig.apiKey);
      if (items && items.length > 0) {
        setPersonalLibrary(items);
      } else {
        setPersonalLibrary(SAMPLE_PERSONAL_LIBRARY);
      }
    }
    loadJellyfin();
  }, [jellyfinConfig]);

  // Featured Hero billboard
  const featuredMovie = useMemo(() => {
    return moviesList.find((m) => m.id === 'stranger-realms') || moviesList[0];
  }, [moviesList]);

  // My List helpers
  const handleToggleMyList = (movie) => {
    setMyList((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleToggleLike = (movieId) => {
    setLikedMovies((prev) => {
      if (prev.includes(movieId)) {
        return prev.filter((id) => id !== movieId);
      } else {
        return [...prev, movieId];
      }
    });
  };

  const handleSaveTmdbKey = (key) => {
    setTmdbApiKey(key);
    localStorage.setItem('netflix_tmdb_key', key);
  };

  const handleSaveJellyfinConfig = (config) => {
    setJellyfinConfig(config);
    localStorage.setItem('netflix_jellyfin_config', JSON.stringify(config));
  };

  const handleResetData = () => {
    setMyList([]);
    setLikedMovies([]);
    setTmdbApiKey('');
    setJellyfinConfig(DEFAULT_JELLYFIN_CONFIG);
    localStorage.clear();
    setMoviesList(CURATED_MOVIES);
    setPersonalLibrary(SAMPLE_PERSONAL_LIBRARY);
    alert('Catalog and preferences have been reset.');
  };

  // Search filter
  const allSearchable = useMemo(() => {
    return [...personalLibrary, ...moviesList];
  }, [personalLibrary, moviesList]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allSearchable.filter((m) => {
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchOverview = m.overview?.toLowerCase().includes(q);
      const matchGenres = m.genres?.some((g) => g.toLowerCase().includes(q));
      const matchCast = m.cast?.some((c) => c.toLowerCase().includes(q));
      return matchTitle || matchOverview || matchGenres || matchCast;
    });
  }, [searchQuery, allSearchable]);

  return (
    <div className="app-root">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        myListCount={myList.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* If Searching, show Search Results Grid */}
        {searchQuery.trim() ? (
          <div className="search-results-container">
            <h2 className="search-title">
              Results for <span className="highlight-query">"{searchQuery}"</span> ({searchResults.length} titles)
            </h2>
            {searchResults.length === 0 ? (
              <div className="no-results">
                <p>Your search for "{searchQuery}" did not have any matches.</p>
                <span>Suggestions:</span>
                <ul>
                  <li>Try different keywords</li>
                  <li>Looking for a movie, series, or personal stream?</li>
                  <li>Check spelling or try a genre</li>
                </ul>
              </div>
            ) : (
              <div className="search-grid">
                {searchResults.map((movie) => {
                  const inList = myList.some((m) => m.id === movie.id);
                  return (
                    <div
                      key={movie.id}
                      className="search-card"
                      onClick={() => setSelectedModalMovie(movie)}
                    >
                      <img
                        src={movie.backdrop || movie.poster}
                        alt={movie.title}
                        className="search-thumbnail"
                      />
                      <div className="search-card-hover">
                        <div className="search-card-actions">
                          <button
                            className="action-btn play-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePlayingMovie(movie);
                            }}
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                          <button
                            className={`action-btn ${inList ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMyList(movie);
                            }}
                          >
                            {inList ? <Check size={16} /> : <Plus size={16} />}
                          </button>
                        </div>
                        <h4 className="search-card-title">{movie.title}</h4>
                        <div className="search-card-meta">
                          <span className="match-tag">{movie.match}% Match</span>
                          <span className="rating-tag">{movie.rating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'my-list' ? (
          /* "My List" Tab */
          <div className="my-list-container">
            <h1 className="tab-page-title">My List</h1>
            {myList.length === 0 ? (
              <div className="empty-list-message">
                <h3>You haven't added any titles to your list yet.</h3>
                <p>Explore titles on the Home page and click the '+' button to add them here.</p>
              </div>
            ) : (
              <div className="my-list-grid">
                {myList.map((movie) => (
                  <div
                    key={movie.id}
                    className="my-list-card"
                    onClick={() => setSelectedModalMovie(movie)}
                  >
                    <img
                      src={movie.backdrop || movie.poster}
                      alt={movie.title}
                      className="my-list-thumbnail"
                    />
                    <div className="my-list-card-overlay">
                      <h4>{movie.title}</h4>
                      <div className="my-list-actions">
                        <button
                          className="action-btn play-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePlayingMovie(movie);
                          }}
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                        <button
                          className="action-btn active"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMyList(movie);
                          }}
                          title="Remove from My List"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'jellyfin' ? (
          /* Personal Library (Jellyfin / Self-Hosted) Tab */
          <div className="personal-library-container">
            <div className="library-header-banner">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive size={28} className="text-red-500" />
                <h1 className="text-3xl font-bold">Personal Media Library (Self-Hosted)</h1>
              </div>
              <p className="library-desc">
                Stream your own local video files and Jellyfin collection with direct play and HLS transcoding.
              </p>
              <button
                className="btn btn-secondary mt-3 text-sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                Configure Jellyfin Server
              </button>
            </div>

            <div className="my-list-grid mt-6">
              {personalLibrary.map((movie) => (
                <div
                  key={movie.id}
                  className="my-list-card"
                  onClick={() => setSelectedModalMovie(movie)}
                >
                  <img
                    src={movie.backdrop || movie.poster}
                    alt={movie.title}
                    className="my-list-thumbnail"
                  />
                  <div className="my-list-card-overlay">
                    <span className="self-hosted-pill">Personal Stream</span>
                    <h4>{movie.title}</h4>
                    <div className="my-list-actions">
                      <button
                        className="action-btn play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePlayingMovie(movie);
                        }}
                        title="Stream in Player"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'originals' ? (
          /* Netflix Originals Tab */
          <div className="originals-page-container">
            <div className="originals-header">
              <span className="netflix-n-badge text-xl px-2 py-0.5">N</span>
              <h1 className="text-3xl font-bold">Only on Netflix</h1>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              Explore authentic Netflix Original series and feature films. Click any title to stream or deep-link directly to Netflix.
            </p>
            <div className="my-list-grid">
              {moviesList.filter((m) => m.isOriginal).map((movie) => (
                <div
                  key={movie.id}
                  className="my-list-card"
                  onClick={() => setSelectedModalMovie(movie)}
                >
                  <img
                    src={movie.backdrop || movie.poster}
                    alt={movie.title}
                    className="my-list-thumbnail"
                  />
                  <div className="my-list-card-overlay">
                    <span className="badge-n mb-1">N</span>
                    <h4>{movie.title}</h4>
                    <div className="my-list-actions">
                      <button
                        className="action-btn play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePlayingMovie(movie);
                        }}
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Home, TV Shows, or Movies Tabs */
          <>
            {/* Billboard Hero Banner */}
            <Billboard
              movie={featuredMovie}
              onPlay={(m) => setActivePlayingMovie(m)}
              onOpenModal={(m) => setSelectedModalMovie(m)}
              isInMyList={myList.some((m) => m.id === featuredMovie?.id)}
              onToggleMyList={handleToggleMyList}
            />

            {/* Category Rows */}
            <div className="rows-container">
              {/* Optional Personal Library Row on Home */}
              {activeTab === 'home' && personalLibrary.length > 0 && (
                <MovieRow
                  title="Your Personal Media Server (Jellyfin)"
                  movies={personalLibrary}
                  onPlay={(m) => setActivePlayingMovie(m)}
                  onOpenModal={(m) => setSelectedModalMovie(m)}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  likedMovies={likedMovies}
                  onToggleLike={handleToggleLike}
                />
              )}

              {CATEGORIES.map((category) => {
                // Apply tab-based filtering
                if (activeTab === 'tv' && category.id === 'movies') return null;
                if (activeTab === 'movies' && category.id === 'tvshows') return null;

                const filtered = category.filter();
                return (
                  <MovieRow
                    key={category.id}
                    title={category.title}
                    movies={filtered}
                    isTop10={category.isTop10}
                    isOriginal={category.isOriginal}
                    onPlay={(m) => setActivePlayingMovie(m)}
                    onOpenModal={(m) => setSelectedModalMovie(m)}
                    myList={myList}
                    onToggleMyList={handleToggleMyList}
                    likedMovies={likedMovies}
                    onToggleLike={handleToggleLike}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Netflix Footer */}
      <footer className="netflix-footer">
        <div className="footer-links-grid">
          <div>
            <a href="#faq">Audio Description</a>
            <a href="#investor">Investor Relations</a>
            <a href="#privacy">Privacy</a>
            <a href="#contact">Contact Us</a>
          </div>
          <div>
            <a href="#help">Help Centre</a>
            <a href="#jobs">Jobs</a>
            <a href="#legal">Legal Notices</a>
          </div>
          <div>
            <a href="#gift">Gift Cards</a>
            <a href="#terms">Terms of Use</a>
            <a href="#cookies">Cookie Preferences</a>
          </div>
          <div>
            <a href="#media">Media Centre</a>
            <a href="#corporate">Corporate Information</a>
          </div>
        </div>
        <div className="service-code-btn">Service Code</div>
        <p className="copyright-text">
          © 2026 Netflix Clone Prototype • Built for Educational & Systems Architecture Analysis
        </p>
      </footer>

      {/* Movie Details Modal */}
      {selectedModalMovie && (
        <MovieDetailModal
          movie={selectedModalMovie}
          onClose={() => setSelectedModalMovie(null)}
          onPlay={(m) => {
            setSelectedModalMovie(null);
            setActivePlayingMovie(m);
          }}
          isInMyList={myList.some((m) => m.id === selectedModalMovie.id)}
          onToggleMyList={handleToggleMyList}
          isLiked={likedMovies.includes(selectedModalMovie.id)}
          onToggleLike={handleToggleLike}
          similarMovies={moviesList.filter((m) => m.id !== selectedModalMovie.id)}
        />
      )}

      {/* Fullscreen Video Player */}
      {activePlayingMovie && (
        <VideoPlayer
          movie={activePlayingMovie}
          onClose={() => setActivePlayingMovie(null)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tmdbApiKey={tmdbApiKey}
        onSaveTmdbKey={handleSaveTmdbKey}
        jellyfinConfig={jellyfinConfig}
        onSaveJellyfinConfig={handleSaveJellyfinConfig}
        onResetData={handleResetData}
      />
    </div>
  );
}
