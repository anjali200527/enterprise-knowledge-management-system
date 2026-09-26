import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Make Your Enterprise Knowledge Work Smarter.</h2>
        <p className="cta-subtitle">
          Connect organizational knowledge, discover relationships and explore enterprise information through one intelligent platform.
        </p>
        <div className="cta-actions">
          <a href="#features" className="btn-primary">Explore KnowSphere &rarr;</a>
          <button className="btn-secondary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
