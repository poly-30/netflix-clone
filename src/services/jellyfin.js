// Jellyfin / Self-Hosted Media Server Service
// Allows streaming personal media collections directly into the Netflix UI

export const DEFAULT_JELLYFIN_CONFIG = {
  serverUrl: 'http://localhost:8096',
  apiKey: '',
  userId: '',
  enabled: false
};

// Built-in sample personal media library so the feature works immediately out of the box
export const SAMPLE_PERSONAL_LIBRARY = [
  {
    id: 'jf-sintel-4k',
    title: 'Sintel (Personal 4K Remaster)',
    originalTitle: 'Sintel',
    overview: 'Personal media library: A lonely young woman searching for her pet dragon whom she nursed back to health, crossing desolate winterlands and battling warriors.',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    type: 'movie',
    rating: 'PG-13',
    match: 99,
    year: 2024,
    duration: '52m',
    quality: '4K ProRes / HLS',
    audio: 'Flac 5.1 / Lossless',
    genres: ['Personal Server', 'Animation', 'Fantasy'],
    cast: ['Local Media Server Library'],
    isOriginal: false,
    isSelfHosted: true,
    hlsUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    fallbackMp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    id: 'jf-tears-of-steel',
    title: 'Tears of Steel (VFX Master)',
    originalTitle: 'Tears of Steel',
    overview: 'Personal media library: Set in a dystopian future in Amsterdam where a group of warriors and scientists gather at the Oude Kerk to stage a crucial historical event.',
    backdrop: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop',
    type: 'movie',
    rating: 'R',
    match: 96,
    year: 2024,
    duration: '1h 12m',
    quality: '1080p 60fps',
    audio: 'Dolby TrueHD',
    genres: ['Personal Server', 'Sci-Fi', 'Action'],
    cast: ['Local Media Server Library'],
    isOriginal: false,
    isSelfHosted: true,
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    fallbackMp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    id: 'jf-home-documentary',
    title: 'Archive 2025: Expedition to the North',
    originalTitle: 'Archive 2025',
    overview: 'Personal media library: High-bitrate 4K raw drone and mirrorless camera recordings captured during the summer expedition across the Fjords.',
    backdrop: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
    poster: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=600&auto=format&fit=crop',
    type: 'movie',
    rating: 'G',
    match: 98,
    year: 2025,
    duration: '45m',
    quality: '4K DCI',
    audio: 'Linear PCM Stereo',
    genres: ['Personal Server', 'Documentary', 'Home Video'],
    cast: ['Family & Friends Archive'],
    isOriginal: false,
    isSelfHosted: true,
    hlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    fallbackMp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }
];

/**
 * Tests connection to a live Jellyfin server
 */
export async function testJellyfinConnection(serverUrl) {
  try {
    const cleanUrl = serverUrl.replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/System/Info/Public`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, serverName: data.ServerName, version: data.Version };
  } catch (err) {
    return { success: false, error: err.message || 'Cannot reach Jellyfin server' };
  }
}

/**
 * Fetches media items from a real Jellyfin server
 */
export async function fetchJellyfinLibrary(serverUrl, apiKey) {
  if (!serverUrl || !apiKey) return null;

  try {
    const cleanUrl = serverUrl.replace(/\/+$/, '');
    const url = `${cleanUrl}/Items?IncludeItemTypes=Movie,Series&Recursive=true&Fields=Overview,PrimaryImageAspectRatio,Path,MediaSources&api_key=${apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Jellyfin error: ${res.status}`);
    const data = await res.json();
    
    if (!data.Items || data.Items.length === 0) return [];

    return data.Items.map((item) => {
      const isTv = item.Type === 'Series';
      const posterUrl = `${cleanUrl}/Items/${item.Id}/Images/Primary?api_key=${apiKey}`;
      const backdropUrl = `${cleanUrl}/Items/${item.Id}/Images/Backdrop?api_key=${apiKey}`;
      
      // HLS Transcoded or direct stream URL from Jellyfin
      const streamUrl = `${cleanUrl}/Videos/${item.Id}/master.m3u8?api_key=${apiKey}&VideoCodec=h264&AudioCodec=aac`;
      const fallbackUrl = `${cleanUrl}/Videos/${item.Id}/stream?static=true&api_key=${apiKey}`;

      return {
        id: `jf-${item.Id}`,
        jellyfinId: item.Id,
        title: item.Name,
        overview: item.Overview || 'Personal media library asset.',
        backdrop: backdropUrl,
        poster: posterUrl,
        type: isTv ? 'tv' : 'movie',
        rating: item.OfficialRating || 'Personal',
        match: 99,
        year: item.ProductionYear || 2024,
        duration: item.RunTimeTicks ? `${Math.round(item.RunTimeTicks / 600000000)}m` : 'Video',
        quality: 'Local Direct Play',
        audio: 'Original Audio',
        genres: ['Personal Server', ...(item.Genres || ['Media'])],
        cast: ['Local Library'],
        isOriginal: false,
        isSelfHosted: true,
        hlsUrl: streamUrl,
        fallbackMp4: fallbackUrl
      };
    });
  } catch (err) {
    console.warn('Failed to fetch from Jellyfin API:', err);
    return null;
  }
}
