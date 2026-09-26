import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="home-hero">
      <div className="hero-content-wrapper">
        <div className="hero-text-section">
          <span className="hero-eyebrow">INTELLIGENT ENTERPRISE KNOWLEDGE PLATFORM</span>
          <h1 className="hero-title">
            Your Enterprise Knowledge.<br />
            One Intelligent Platform.
          </h1>
          <p className="hero-description">
            Connect employees, projects, documents, and relationships in one intelligent platform. Discover, explore, and access your organization's knowledge with ease.
          </p>
          <div className="hero-actions">
            <a href="#features" className="btn-primary">Explore KnowSphere</a>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              See How It Works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
