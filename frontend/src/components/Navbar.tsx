import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import UserAvatar from './common/UserAvatar.tsx';
import UserDropdownModal from './common/UserDropdownModal.tsx';
import { HomeIcon, VideoIcon, UploadIcon, LogoIcon } from '../assets/icons/index.tsx';
import '../css/components/Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <LogoIcon className="navbar-logo" />
          <span>VideoStream</span>
        </Link>

        <div className="navbar-nav">
          <Link to="/" className="nav-link">
            <HomeIcon />
            <span>Home</span>
          </Link>

          {user ? (
            <>
              <Link to="/my-videos" className="nav-link">
                <VideoIcon />
                <span>My Videos</span>
              </Link>
              <div className="navbar-actions">
                <Link to="/upload" className="btn-nav btn-nav-primary">
                  <UploadIcon />
                  <span>Upload</span>
                </Link>
                <div className="profile-dropdown-wrapper">
                  <div 
                    className="profile-button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <UserAvatar username={user.username} size="md" />
                  </div>
                  {isDropdownOpen && (
                    <UserDropdownModal
                      username={user.username}
                      isOpen={isDropdownOpen}
                      onClose={() => setIsDropdownOpen(false)}
                      onViewProfile={handleViewProfile}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-actions">
              <Link to="/login" className="btn-nav btn-nav-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-nav btn-nav-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
