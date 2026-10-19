import React, { useEffect } from 'react';
import { X, Play, Plus, Check, ThumbsUp, ExternalLink, HardDrive } from 'lucide-react';

export default function MovieDetailModal({
  movie,
  onClose,
  onPlay,
  isInMyList,
  onToggleMyList,
  isLiked,
  onToggleLike,
  similarMovies = []
}) {
  useEffect(() => {
    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!movie) return null;

  const netflixUrl = movie.netflixDeepLink || `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Hero Banner */}
        <div
          className="modal-hero"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        >
          <div className="modal-hero-vignette"></div>

          <div className="modal-hero-content">
            {movie.isSelfHosted ? (
              <div className="self-hosted-badge">
                <HardDrive size={14} />
                <span>SELF-HOSTED / JELLYFIN MEDIA</span>
              </div>
            ) : movie.isOriginal ? (
              <div className="billboard-series-badge">
                <span className="netflix-n-badge">N</span>
                <span className="series-text">{movie.type === 'tv' ? 'S E R I E S' : 'F I L M'}</span>
              </div>
            ) : null}

            <h2 className="modal-title">{movie.title}</h2>

            <div className="modal-actions">
              {/* In-app streaming */}
              <button className="btn btn-primary" onClick={() => onPlay(movie)}>
                <Play size={20} fill="currentColor" />
                <span>Play In-App</span>
              </button>

              {/* Official Netflix Deep Link */}
              {!movie.isSelfHosted && (
                <a
                  href={netflixUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary flex items-center gap-2"
                  title="Watch on official Netflix"
                >
                  <ExternalLink size={18} />
                  <span>Watch on Netflix</span>
                </a>
              )}

              {/* Add to My List */}
              <button
                className={`btn btn-circle ${isInMyList ? 'active' : ''}`}
                onClick={() => onToggleMyList(movie)}
                title={isInMyList ? 'Remove from My List' : 'Add to My List'}
              >
                {isInMyList ? <Check size={18} /> : <Plus size={18} />}
              </button>

              {/* Like */}
              <button
                className={`btn btn-circle ${isLiked ? 'active' : ''}`}
                onClick={() => onToggleLike(movie.id)}
                title={isLiked ? 'Liked' : 'Like'}
              >
                <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="modal-grid">
            {/* Left info column */}
            <div className="modal-main-info">
              <div className="modal-meta-row">
                <span className="meta-match">{movie.match}% Match</span>
                <span className="meta-year">{movie.year}</span>
                <span className="meta-badge">{movie.rating}</span>
                <span className="meta-duration">{movie.duration}</span>
                <span className="meta-quality">{movie.quality}</span>
                <span className="meta-audio">{movie.audio}</span>
              </div>

              <p className="modal-overview">{movie.overview}</p>
            </div>

            {/* Right metadata column */}
            <div className="modal-side-info">
              <div className="meta-field">
                <span className="field-label">Cast: </span>
                <span className="field-value">{movie.cast ? movie.cast.join(', ') : 'Ensemble cast'}</span>
              </div>
              <div className="meta-field">
                <span className="field-label">Genres: </span>
                <span className="field-value">{movie.genres ? movie.genres.join(', ') : 'Drama'}</span>
              </div>
              <div className="meta-field">
                <span className="field-label">Source Type: </span>
                <span className="field-value font-semibold">
                  {movie.isSelfHosted ? 'Personal Media Server (Direct Play)' : 'Netflix Catalog / TMDB'}
                </span>
              </div>
            </div>
          </div>

          {/* Episode List if TV show */}
          {movie.type === 'tv' && movie.episodes && movie.episodes.length > 0 && (
            <div className="modal-episodes-section">
              <div className="episodes-header">
                <h3>Episodes</h3>
                <span className="season-selector">Season 1</span>
              </div>

              <div className="episodes-list">
                {movie.episodes.map((ep, idx) => (
                  <div
                    key={ep.id}
                    className="episode-item"
                    onClick={() => onPlay(movie)}
                  >
                    <div className="episode-number">{idx + 1}</div>
                    <div className="episode-thumbnail-wrap">
                      <img src={ep.thumbnail} alt={ep.title} className="episode-thumbnail" />
                      <div className="episode-play-overlay">
                        <Play size={24} fill="white" />
                      </div>
                    </div>
                    <div className="episode-details">
                      <div className="episode-title-row">
                        <span className="episode-title">{ep.title}</span>
                        <span className="episode-duration">{ep.duration}</span>
                      </div>
                      <p className="episode-desc">{ep.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This Recommendations */}
          {similarMovies.length > 0 && (
            <div className="modal-similar-section">
              <h3>More Like This</h3>
              <div className="similar-grid">
                {similarMovies.slice(0, 6).map((sim) => (
                  <div key={sim.id} className="similar-card">
                    <div className="similar-thumbnail-wrap">
                      <img src={sim.backdrop || sim.poster} alt={sim.title} className="similar-thumbnail" />
                      <span className="similar-duration">{sim.duration}</span>
                      <button
                        className="similar-play-btn"
                        onClick={() => onPlay(sim)}
                        title="Play in-app"
                      >
                        <Play size={18} fill="white" />
                      </button>
                    </div>
                    <div className="similar-info">
                      <div className="similar-meta">
                        <span className="meta-match">{sim.match}% Match</span>
                        <span className="meta-badge">{sim.rating}</span>
                      </div>
                      <h4 className="similar-title">{sim.title}</h4>
                      <p className="similar-overview">{sim.overview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
