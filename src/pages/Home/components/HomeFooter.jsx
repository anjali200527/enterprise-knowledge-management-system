import React from 'react';
import { Link } from 'react-router-dom';
import './HomeFooter.css';

const HomeFooter = () => {
  return (
    <footer className="home-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">KnowSphere</div>
          <p className="footer-tagline">Intelligent Enterprise Knowledge Platform</p>
        </div>
        
        <div className="footer-links">
          <a href="#hero">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <Link to="/dashboard">Dashboard</Link>
          <a href="#about">About</a>
          <Link to="/contact">Contact</Link>
          <Link to="/help">Help</Link>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} KnowSphere. All rights reserved.
      </div>
    </footer>
  );
};

export default HomeFooter;
