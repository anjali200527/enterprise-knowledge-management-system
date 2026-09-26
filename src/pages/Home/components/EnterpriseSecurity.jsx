import React from 'react';
import './EnterpriseSecurity.css';
import { FaShieldAlt, FaSitemap, FaLink, FaRobot } from 'react-icons/fa';

const EnterpriseSecurity = () => {
  return (
    <section id="about" className="enterprise-security-section">
      <div className="security-container">
        <h2 className="security-title">Built for Connected Enterprise Knowledge</h2>
        
        <div className="security-grid">
          <div className="security-card">
            <FaShieldAlt className="security-icon" />
            <h3>Secure Access</h3>
            <p>Role-based authentication ensures enterprise knowledge is only accessed by authorized employees.</p>
          </div>
          <div className="security-card">
            <FaSitemap className="security-icon" />
            <h3>Structured Information</h3>
            <p>Organizational information is systematically organized using modern database technology.</p>
          </div>
          <div className="security-card">
            <FaLink className="security-icon" />
            <h3>Connected Relationships</h3>
            <p>Connect disparate enterprise silos to create a unified view of your organization.</p>
          </div>
          <div className="security-card">
            <FaRobot className="security-icon" />
            <h3>AI-Assisted Discovery</h3>
            <p>Advanced language models help interpret and navigate complex enterprise datasets seamlessly.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSecurity;
