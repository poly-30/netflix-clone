import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, X, ChevronDown, Check } from 'lucide-react';

export default function Navbar({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  myListCount,
  onOpenSettings
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'originals', label: 'Netflix Originals' },
    { id: 'tv', label: 'TV Shows' },
    { id: 'movies', label: 'Movies' },
    { id: 'jellyfin', label: 'Personal Library' },
    { id: 'my-list', label: `My List ${myListCount > 0 ? `(${myListCount})` : ''}` }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-left">
        {/* Netflix Iconic Logo */}
        <div className="netflix-logo" onClick={() => onSelectTab('home')}>
          NETFLIX
        </div>

        {/* Navigation links */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-right">
        {/* Search input with expand animation */}
        <div className={`search-container ${showSearch || searchQuery ? 'open' : ''}`}>
          <Search
            className="nav-icon search-trigger"
            size={20}
            onClick={() => setShowSearch(!showSearch)}
          />
          <input
            type="text"
            placeholder="Titles, people, genres..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <X
              className="search-clear-icon"
              size={16}
              onClick={() => onSearchChange('')}
            />
          )}
        </div>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} className="nav-icon" />
            <span className="notification-badge">3</span>
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-menu">
              <div className="dropdown-header">Recent Releases</div>
              <div className="notification-item">
                <span className="dot"></span>
                <div>
                  <p className="notif-title">New Arrival: Neon Odyssey 2099</p>
                  <p className="notif-time">2 hours ago</p>
                </div>
              </div>
              <div className="notification-item">
                <span className="dot"></span>
                <div>
                  <p className="notif-title">Stranger Realms: Season 4 is now streaming</p>
                  <p className="notif-time">Yesterday</p>
                </div>
              </div>
              <div className="notification-item">
                <span className="dot"></span>
                <div>
                  <p className="notif-title">Top 10 update for your region</p>
                  <p className="notif-time">3 days ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <div
            className="profile-container"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
              alt="Profile"
              className="profile-avatar"
            />
            <ChevronDown size={14} className={`profile-chevron ${showProfileMenu ? 'rotated' : ''}`} />
          </div>

          {showProfileMenu && (
            <div className="dropdown-menu profile-menu">
              <div className="profile-header">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                  alt="Profile"
                  className="profile-avatar-small"
                />
                <span className="profile-name">Rahul</span>
              </div>
              <hr className="menu-divider" />
              <button
                className="menu-action"
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenSettings();
                }}
              >
                <Settings size={16} />
                <span>Streaming & API Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
