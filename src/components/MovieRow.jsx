import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';

export default function MovieRow({
  title,
  movies,
  isTop10 = false,
  isOriginal = false,
  onPlay,
  onOpenModal,
  myList = [],
  onToggleMyList,
  likedMovies = [],
  onToggleLike
}) {
  const rowRef = useRef(null);
  const [hoveredMovieId, setHoveredMovieId] = useState(null);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className={`movie-row ${isTop10 ? 'top10-row' : ''}`}>
      <h2 className="row-title">
        {title}
        <span className="explore-all">Explore All &gt;</span>
      </h2>

      <div className="row-container">
        {/* Left Slider Arrow */}
        <button
          className="slider-arrow left-arrow"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Movies Carousel */}
        <div className="row-items" ref={rowRef}>
          {movies.map((movie, index) => {
            const inList = myList.some((m) => m.id === movie.id);
            const isLiked = likedMovies.includes(movie.id);

            return (
              <div
                key={movie.id}
                className={`movie-card-wrapper ${isTop10 ? 'top10-card' : ''} ${isOriginal ? 'original-card' : ''}`}
                onMouseEnter={() => setHoveredMovieId(movie.id)}
                onMouseLeave={() => setHoveredMovieId(null)}
              >
                {/* Large Number for Top 10 */}
                {isTop10 && (
                  <div className="top10-rank-number">
                    {index + 1}
                  </div>
                )}

                <div className="movie-card" onClick={() => onOpenModal(movie)}>
                  <img
                    src={isOriginal || isTop10 ? movie.poster : (movie.backdrop || movie.poster)}
                    alt={movie.title}
                    className="card-thumbnail"
                    loading="lazy"
                  />

                  {/* Netflix N Badge on originals */}
                  {movie.isOriginal && (
                    <div className="card-badge">
                      <span className="badge-n">N</span>
                    </div>
                  )}

                  {/* Hover Card Popup Details */}
                  {hoveredMovieId === movie.id && (
                    <div className="card-hover-overlay" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={movie.backdrop || movie.poster}
                        alt={movie.title}
                        className="hover-thumbnail"
                      />
                      <div className="hover-details">
                        <div className="hover-actions">
                          <div className="left-actions">
                            <button
                              className="action-btn play-btn"
                              onClick={() => onPlay(movie)}
                              title="Play"
                            >
                              <Play size={16} fill="currentColor" />
                            </button>
                            <button
                              className={`action-btn ${inList ? 'active' : ''}`}
                              onClick={() => onToggleMyList(movie)}
                              title={inList ? 'Remove from My List' : 'Add to My List'}
                            >
                              {inList ? <Check size={16} /> : <Plus size={16} />}
                            </button>
                            <button
                              className={`action-btn ${isLiked ? 'active text-red' : ''}`}
                              onClick={() => onToggleLike(movie.id)}
                              title={isLiked ? 'Liked' : 'Like'}
                            >
                              <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <button
                            className="action-btn expand-btn"
                            onClick={() => onOpenModal(movie)}
                            title="More Info"
                          >
                            <ChevronDown size={18} />
                          </button>
                        </div>

                        <h4 className="hover-title">{movie.title}</h4>

                        <div className="hover-meta">
                          <span className="match-tag">{movie.match}% Match</span>
                          <span className="rating-tag">{movie.rating}</span>
                          <span className="duration-tag">{movie.duration}</span>
                          <span className="hd-tag">{movie.quality.includes('4K') ? '4K' : 'HD'}</span>
                        </div>

                        <div className="hover-genres">
                          {movie.genres.slice(0, 3).map((g, i) => (
                            <span key={g} className="genre-dot">
                              {g}{i < Math.min(movie.genres.length, 3) - 1 ? ' • ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Slider Arrow */}
        <button
          className="slider-arrow right-arrow"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}
