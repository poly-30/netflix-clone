// TMDB API service with full Netflix catalog querying & deep linking
import { CURATED_MOVIES } from '../data/movies';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export async function fetchFromTmdb(endpoint, apiKey) {
  if (!apiKey) return null;
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${apiKey}&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch from TMDB, using fallback:', err);
    return null;
  }
}

export function formatTmdbItem(item, isOriginalOverride = false) {
  const isTv = !!item.first_air_date || item.media_type === 'tv';
  const title = item.title || item.name || 'Untitled';
  
  return {
    id: `tmdb-${item.id}`,
    tmdbId: item.id,
    title,
    originalTitle: item.original_title || item.original_name,
    overview: item.overview || 'No synopsis available for this title.',
    backdrop: getImageUrl(item.backdrop_path, 'original') || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    poster: getImageUrl(item.poster_path, 'w500') || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    type: isTv ? 'tv' : 'movie',
    rating: item.adult ? 'R' : (item.vote_average > 7.5 ? 'TV-MA' : 'PG-13'),
    match: Math.min(99, Math.max(68, Math.round((item.vote_average || 7.2) * 10) + 3)),
    year: parseInt((item.release_date || item.first_air_date || '2024').substring(0, 4), 10),
    duration: isTv ? 'Series' : '2h 05m',
    quality: '4K Ultra HD',
    audio: 'Spatial Audio 5.1',
    genres: ['Netflix', isTv ? 'TV Series' : 'Blockbuster Movie'],
    cast: ['Hollywood Cast'],
    isOriginal: isOriginalOverride || (isTv && (item.vote_average > 7.5 || item.popularity > 50)),
    // Deep link to official Netflix watch page or search
    netflixDeepLink: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
    // Open ABR stream for in-app demo video playback
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    fallbackMp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };
}

/**
 * Fetches actual Netflix Original series and Netflix catalog movies from TMDB
 */
export async function fetchFullNetflixCatalog(apiKey) {
  if (!apiKey) return null;

  try {
    // 1. Netflix Original TV Series (Network 213 is Netflix)
    const tvPromise = fetchFromTmdb('/discover/tv?with_networks=213&sort_by=popularity.desc', apiKey);
    
    // 2. Movies streaming on Netflix (Watch Provider 8 is Netflix in US/Global)
    const moviePromise = fetchFromTmdb('/discover/movie?with_watch_providers=8&watch_region=US&sort_by=popularity.desc', apiKey);
    
    // 3. Weekly Trending Titles
    const trendingPromise = fetchFromTmdb('/trending/all/week', apiKey);

    const [tvData, movieData, trendingData] = await Promise.all([tvPromise, moviePromise, trendingPromise]);

    const netflixOriginals = (tvData?.results || []).map(item => formatTmdbItem(item, true));
    const netflixMovies = (movieData?.results || []).map(item => formatTmdbItem(item, false));
    const trending = (trendingData?.results || []).map(item => formatTmdbItem(item, false));

    return {
      netflixOriginals,
      netflixMovies,
      trending,
      all: [...netflixOriginals, ...netflixMovies, ...trending]
    };
  } catch (err) {
    console.error('Error fetching Netflix catalog from TMDB:', err);
    return null;
  }
}
