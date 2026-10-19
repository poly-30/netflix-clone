import React, { useState } from 'react';
import { X, Key, HardDrive, ExternalLink, RefreshCw, Cpu, Check, AlertCircle } from 'lucide-react';
import { testJellyfinConnection } from '../services/jellyfin';

export default function SettingsModal({
  isOpen,
  onClose,
  tmdbApiKey,
  onSaveTmdbKey,
  jellyfinConfig,
  onSaveJellyfinConfig,
  onResetData
}) {
  const [activeTab, setActiveTab] = useState('tmdb');
  
  // TMDB state
  const [tmdbInput, setTmdbInput] = useState(tmdbApiKey || '');
  const [tmdbStatus, setTmdbStatus] = useState('');
  const [testingTmdb, setTestingTmdb] = useState(false);

  // Jellyfin state
  const [jfUrl, setJfUrl] = useState(jellyfinConfig?.serverUrl || 'http://localhost:8096');
  const [jfApiKey, setJfApiKey] = useState(jellyfinConfig?.apiKey || '');
  const [jfStatus, setJfStatus] = useState('');
  const [testingJf, setTestingJf] = useState(false);

  if (!isOpen) return null;

  const handleSaveTmdb = async () => {
    if (!tmdbInput.trim()) {
      onSaveTmdbKey('');
      setTmdbStatus('Switched to default curated Netflix showcase.');
      return;
    }

    setTestingTmdb(true);
    setTmdbStatus('');
    try {
      const res = await fetch(`https://api.themoviedb.org/3/authentication?api_key=${tmdbInput.trim()}`);
      const data = await res.json();
      if (data.success) {
        onSaveTmdbKey(tmdbInput.trim());
        setTmdbStatus('Connected! Fetching live Netflix Originals & trending movies.');
      } else {
        setTmdbStatus(`API Key Error: ${data.status_message || 'Verification failed'}`);
      }
    } catch {
      onSaveTmdbKey(tmdbInput.trim());
      setTmdbStatus('API key saved locally.');
    } finally {
      setTestingTmdb(false);
    }
  };

  const handleTestAndSaveJellyfin = async () => {
    setTestingJf(true);
    setJfStatus('');
    const result = await testJellyfinConnection(jfUrl);
    if (result.success) {
      setJfStatus(`Connected to ${result.serverName || 'Jellyfin'} (v${result.version || 'Server'})!`);
      onSaveJellyfinConfig({
        serverUrl: jfUrl,
        apiKey: jfApiKey,
        enabled: true
      });
    } else {
      setJfStatus(`Connection Note: Could not reach server at ${jfUrl} (${result.error}). Config saved with demo media library enabled.`);
      onSaveJellyfinConfig({
        serverUrl: jfUrl,
        apiKey: jfApiKey,
        enabled: true
      });
    }
    setTestingJf(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="flex items-center gap-2">
            <Cpu size={22} className="text-red-500" />
            <h2>Catalog & Streaming Integration Settings</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="settings-tabs-header">
          <button
            className={`settings-tab-btn ${activeTab === 'tmdb' ? 'active' : ''}`}
            onClick={() => setActiveTab('tmdb')}
          >
            <Key size={16} />
            <span>TMDB (Netflix Catalog)</span>
          </button>
          <button
            className={`settings-tab-btn ${activeTab === 'jellyfin' ? 'active' : ''}`}
            onClick={() => setActiveTab('jellyfin')}
          >
            <HardDrive size={16} />
            <span>Jellyfin (Self-Hosted)</span>
          </button>
          <button
            className={`settings-tab-btn ${activeTab === 'deeplink' ? 'active' : ''}`}
            onClick={() => setActiveTab('deeplink')}
          >
            <ExternalLink size={16} />
            <span>Netflix Deep-Linking</span>
          </button>
        </div>

        <div className="settings-body">
          {/* TAB 1: TMDB Integration */}
          {activeTab === 'tmdb' && (
            <div className="settings-section">
              <label className="section-title">
                <Key size={18} />
                <span>Live Netflix Catalog via TMDB API</span>
              </label>
              <p className="section-desc">
                By entering a free TMDB API key, this app automatically queries Netflix Network ID (<code>213</code>) and Watch Provider ID (<code>8</code>) to populate the interface with all real Netflix Originals and trending titles.
              </p>
              <div className="settings-input-row">
                <input
                  type="text"
                  placeholder="Enter TMDB v3 API Key (optional)"
                  value={tmdbInput}
                  onChange={(e) => setTmdbInput(e.target.value)}
                  className="settings-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSaveTmdb}
                  disabled={testingTmdb}
                >
                  {testingTmdb ? 'Connecting...' : 'Save & Fetch'}
                </button>
              </div>
              {tmdbStatus && (
                <p className={`status-msg ${tmdbStatus.includes('Connected') || tmdbStatus.includes('saved') ? 'success' : 'warn'}`}>
                  {tmdbStatus}
                </p>
              )}
            </div>
          )}

          {/* TAB 2: Jellyfin Self-Hosted */}
          {activeTab === 'jellyfin' && (
            <div className="settings-section">
              <label className="section-title">
                <HardDrive size={18} />
                <span>Stream Your Personal Media Library (Jellyfin)</span>
              </label>
              <p className="section-desc">
                Connect your self-hosted Jellyfin media server. Movies and TV series in your local library will be transcoded to HLS and streamed directly inside this Netflix UI.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Jellyfin Server URL (e.g. http://localhost:8096)"
                  value={jfUrl}
                  onChange={(e) => setJfUrl(e.target.value)}
                  className="settings-input"
                />
                <input
                  type="text"
                  placeholder="Jellyfin API Key (Dashboard > API Keys)"
                  value={jfApiKey}
                  onChange={(e) => setJfApiKey(e.target.value)}
                  className="settings-input"
                />
                <button
                  className="btn btn-primary w-fit"
                  onClick={handleTestAndSaveJellyfin}
                  disabled={testingJf}
                >
                  {testingJf ? 'Testing...' : 'Connect to Jellyfin'}
                </button>
              </div>
              {jfStatus && (
                <p className={`status-msg ${jfStatus.includes('Connected') ? 'success' : 'warn'}`}>
                  {jfStatus}
                </p>
              )}
            </div>
          )}

          {/* TAB 3: Deep Linking */}
          {activeTab === 'deeplink' && (
            <div className="settings-section">
              <label className="section-title">
                <ExternalLink size={18} />
                <span>Official Netflix Deep-Linking</span>
              </label>
              <p className="section-desc">
                When browsing titles in this app, clicking <strong>"Watch on Netflix"</strong> automatically generates a deep-link directly to the official title on Netflix web or launches the native Netflix application on smart devices.
              </p>
              <div className="arch-insights-list">
                <div><strong>Web Deep Link:</strong> <code>https://www.netflix.com/search?q=[Title]</code></div>
                <div className="mt-2"><strong>Smart TV / Mobile App URI:</strong> <code>nflx://www.netflix.com/title/[ID]</code></div>
                <div className="mt-2"><strong>In-App Playback:</strong> Plays the high-resolution demo ABR stream or your self-hosted media server file.</div>
              </div>
            </div>
          )}

          {/* Reset App Data */}
          <div className="settings-section border-t border-gray-800 pt-4">
            <label className="section-title">
              <RefreshCw size={18} />
              <span>Reset & Local Storage</span>
            </label>
            <p className="section-desc">
              Clear saved bookmarks in "My List" and reset saved API keys.
            </p>
            <button className="btn btn-secondary w-fit" onClick={onResetData}>
              Clear Saved My List & Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
