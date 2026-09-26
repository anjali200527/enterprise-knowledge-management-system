import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="home-hero">
      <div className="hero-content-wrapper">
        <div className="hero-text-section">
          <span className="hero-eyebrow">AI-POWERED ENTERPRISE KNOWLEDGE</span>
          <h1 className="hero-title">Turn Enterprise Knowledge Into Intelligent Action.</h1>
          <p className="hero-description">
            Connect people, projects, documents and organizational knowledge through one intelligent enterprise platform.
          </p>
          <div className="hero-actions">
            <a href="#features" className="btn-primary">Explore KnowSphere &rarr;</a>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
