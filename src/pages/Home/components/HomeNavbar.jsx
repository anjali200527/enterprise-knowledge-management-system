import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './HomeNavbar.css';

const HomeNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="home-navbar">
      <div className="home-navbar-container">
        {/* Logo */}
        <Link to="/" className="home-logo" onClick={closeMenu}>
          <div className="logo-icon">K</div>
          <div className="logo-text-group">
            <span className="logo-text">KnowSphere</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="home-nav-links">
          <a href="#hero">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#platform">Platform</a>
          <a href="#about">About</a>
        </div>

        {/* Auth Buttons */}
        <div className="home-nav-auth">
          <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-register" onClick={() => navigate('/signup')}>Get Started</button>
        </div>

        {/* Mobile Hamburger */}
        <button className="mobile-menu-icon" onClick={toggleMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <a href="#hero" onClick={closeMenu}>Home</a>
        <a href="#features" onClick={closeMenu}>Features</a>
        <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
        <a href="#platform" onClick={closeMenu}>Platform</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <div className="mobile-auth-buttons">
          <button className="btn-login" onClick={() => { closeMenu(); navigate('/login'); }}>Login</button>
          <button className="btn-register" onClick={() => { closeMenu(); navigate('/signup'); }}>Get Started</button>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
