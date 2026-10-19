import React, { useState } from 'react';
import { Play, Info, Volume2, VolumeX, Plus, Check } from 'lucide-react';

export default function Billboard({ movie, onPlay, onOpenModal, isInMyList, onToggleMyList }) {
  const [isMuted, setIsMuted] = useState(true);

  if (!movie) return null;

  return (
    <div className="billboard">
      {/* Background image & gradient overlay */}
      <div
        className="billboard-image"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      >
        <div className="billboard-vignette-top"></div>
        <div className="billboard-vignette-left"></div>
        <div className="billboard-vignette-bottom"></div>
      </div>

      {/* Hero Content */}
      <div className="billboard-content">
        {movie.isOriginal && (
          <div className="billboard-series-badge">
            <span className="netflix-n-badge">N</span>
            <span className="series-text">{movie.type === 'tv' ? 'S E R I E S' : 'F I L M'}</span>
          </div>
        )}

        <h1 className="billboard-title">{movie.title}</h1>

        <div className="billboard-meta">
          <span className="meta-match">{movie.match}% Match</span>
          <span className="meta-year">{movie.year}</span>
          <span className="meta-badge">{movie.rating}</span>
          <span className="meta-duration">{movie.duration}</span>
          <span className="meta-quality">{movie.quality}</span>
        </div>

        <p className="billboard-overview">{movie.overview}</p>

        <div className="billboard-actions">
          <button className="btn btn-primary" onClick={() => onPlay(movie)}>
            <Play size={22} fill="currentColor" />
            <span>Play</span>
          </button>

          <button className="btn btn-secondary" onClick={() => onOpenModal(movie)}>
            <Info size={22} />
            <span>More Info</span>
          </button>

          <button
            className={`btn btn-circle ${isInMyList ? 'active' : ''}`}
            onClick={() => onToggleMyList(movie)}
            title={isInMyList ? 'Remove from My List' : 'Add to My List'}
          >
            {isInMyList ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {/* Right side age rating and sound button */}
      <div className="billboard-right-controls">
        <button
          className="sound-toggle-btn"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="age-rating-pill">
          {movie.rating}
        </div>
      </div>
    </div>
  );
}
