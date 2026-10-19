import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Settings,
  Activity,
  Layers,
  Gauge
} from 'lucide-react';

export default function VideoPlayer({ movie, onClose }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // HLS stream levels (qualities)
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto ABR
  const [streamStats, setStreamStats] = useState({
    bitrate: 0,
    resolution: 'Auto',
    bufferLength: 0
  });

  // Setup HLS / Video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = movie.hlsUrl || movie.fallbackMp4;

    if (Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setLevels(data.levels || []);
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setStreamStats((prev) => ({
            ...prev,
            bitrate: Math.round(lvl.bitrate / 1000),
            resolution: `${lvl.width}x${lvl.height}`
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error, falling back to MP4:', data);
          if (movie.fallbackMp4) {
            video.src = movie.fallbackMp4;
            video.play().catch(() => {});
          }
        }
      });
    } else {
      // Native MP4 or Safari HLS
      video.src = movie.fallbackMp4 || streamUrl;
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [movie]);

  // Handle keyboard shortcuts (Space to play/pause, Left/Right 10s, F for fullscreen, Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen]);

  // Auto-hide controls on mouse idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
      }
    }, 3000);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);

      // Calculate buffered end
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered(bufferedEnd);
        setStreamStats((prev) => ({
          ...prev,
          bufferLength: Math.max(0, Math.round(bufferedEnd - videoRef.current.currentTime))
        }));
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const willMute = !isMuted;
      videoRef.current.muted = willMute;
      setIsMuted(willMute);
      if (!willMute && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const setSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const setQuality = (lvlIndex) => {
    setCurrentLevel(lvlIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvlIndex;
    }
    setShowQualityMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timeRemaining = duration - currentTime;

  return (
    <div
      ref={containerRef}
      className={`video-player-container ${showControls ? 'show-controls' : 'hide-controls'}`}
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="video-element"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      {/* Top Header Bar */}
      <div className="player-top-bar" onClick={(e) => e.stopPropagation()}>
        <button className="player-back-btn" onClick={onClose} title="Back to Browse">
          <ArrowLeft size={28} />
        </button>
        <div className="player-title-info">
          <h3 className="player-movie-title">{movie.title}</h3>
          {movie.type === 'tv' && <span className="player-episode-sub">S1:E1 Chapter One</span>}
        </div>
        <button
          className={`player-stats-btn ${showStats ? 'active' : ''}`}
          onClick={() => setShowStats(!showStats)}
          title="Streaming Diagnostics"
        >
          <Activity size={20} />
        </button>
      </div>

      {/* Live Stream Diagnostics Overlay */}
      {showStats && (
        <div className="player-stats-overlay" onClick={(e) => e.stopPropagation()}>
          <h4>ABR Stream Diagnostics</h4>
          <div className="stat-row">
            <span>Protocol:</span>
            <strong>{movie.hlsUrl ? 'HLS (RFC 8216)' : 'Progressive MP4'}</strong>
          </div>
          <div className="stat-row">
            <span>Current Quality:</span>
            <strong>{streamStats.resolution}</strong>
          </div>
          <div className="stat-row">
            <span>Estimated Bitrate:</span>
            <strong>{streamStats.bitrate ? `${streamStats.bitrate} kbps` : 'Variable'}</strong>
          </div>
          <div className="stat-row">
            <span>Forward Buffer:</span>
            <strong>{streamStats.bufferLength}s</strong>
          </div>
          <div className="stat-row">
            <span>ABR Mode:</span>
            <strong>{currentLevel === -1 ? 'Adaptive (Auto BBA)' : 'Manual Override'}</strong>
          </div>
        </div>
      )}

      {/* Center Big Play/Pause indicator on pause */}
      {!isPlaying && (
        <div className="center-play-badge">
          <Play size={48} fill="white" />
        </div>
      )}

      {/* Bottom Transport Controls */}
      <div className="player-bottom-controls" onClick={(e) => e.stopPropagation()}>
        {/* Scrubber / Progress Bar */}
        <div className="progress-container" onClick={handleSeek}>
          <div
            className="progress-buffered"
            style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }}
          />
          <div
            className="progress-played"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="scrubber-thumb" />
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="controls-row">
          <div className="left-controls">
            <button className="ctrl-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={26} fill="white" /> : <Play size={26} fill="white" />}
            </button>

            <button className="ctrl-btn" onClick={() => skipTime(-10)} title="Rewind 10 seconds">
              <RotateCcw size={24} />
              <span className="skip-badge">10</span>
            </button>

            <button className="ctrl-btn" onClick={() => skipTime(10)} title="Fast forward 10 seconds">
              <RotateCw size={24} />
              <span className="skip-badge">10</span>
            </button>

            {/* Volume */}
            <div className="volume-control-group">
              <button className="ctrl-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            {/* Time remaining */}
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span className="time-divider">/</span>
              <span>{formatTime(duration)}</span>
              <span className="time-remaining">(-{formatTime(timeRemaining)})</span>
            </div>
          </div>

          <div className="right-controls">
            {/* Speed Selector */}
            <div className="relative">
              <button
                className="ctrl-btn text-label-btn"
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                }}
                title="Playback Speed"
              >
                <Gauge size={20} />
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="player-popup-menu">
                  <div className="popup-header">Playback Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      className={`popup-item ${playbackSpeed === s ? 'selected' : ''}`}
                      onClick={() => setSpeed(s)}
                    >
                      {s}x {s === 1 ? '(Normal)' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality / Resolution Selector */}
            {levels.length > 0 && (
              <div className="relative">
                <button
                  className="ctrl-btn text-label-btn"
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSpeedMenu(false);
                  }}
                  title="Stream Quality"
                >
                  <Layers size={20} />
                  <span>{currentLevel === -1 ? 'Auto' : `${levels[currentLevel]?.height}p`}</span>
                </button>

                {showQualityMenu && (
                  <div className="player-popup-menu">
                    <div className="popup-header">Stream Quality (ABR)</div>
                    <button
                      className={`popup-item ${currentLevel === -1 ? 'selected' : ''}`}
                      onClick={() => setQuality(-1)}
                    >
                      Auto (Adaptive Bitrate)
                    </button>
                    {levels.map((lvl, idx) => (
                      <button
                        key={idx}
                        className={`popup-item ${currentLevel === idx ? 'selected' : ''}`}
                        onClick={() => setQuality(idx)}
                      >
                        {lvl.height}p ({Math.round(lvl.bitrate / 1000)} kbps)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button className="ctrl-btn" onClick={toggleFullscreen} title="Fullscreen (f)">
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
