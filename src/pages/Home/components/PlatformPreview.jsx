import React from 'react';
import './PlatformPreview.css';
import { FaUserTie, FaProjectDiagram, FaFileAlt, FaNetworkWired, FaRobot } from 'react-icons/fa';

const PlatformPreview = () => {
  return (
    <section id="platform" className="platform-preview-section">
      <div className="preview-container">
        <h2 className="preview-title">Your Enterprise Knowledge. One Intelligent Platform.</h2>
        
        <div className="dashboard-mockup">
          <div className="mockup-sidebar">
            <div className="mockup-logo">KnowSphere</div>
            <div className="mockup-nav-item active"><FaProjectDiagram /> Dashboard</div>
            <div className="mockup-nav-item"><FaUserTie /> Employees</div>
            <div className="mockup-nav-item"><FaProjectDiagram /> Projects</div>
            <div className="mockup-nav-item"><FaFileAlt /> Documents</div>
            <div className="mockup-nav-item"><FaNetworkWired /> Relationships</div>
            <div className="mockup-nav-item"><FaRobot /> AI Assistant</div>
          </div>
          <div className="mockup-main">
            <div className="mockup-header">
              <div className="mockup-search">Search enterprise knowledge...</div>
              <div className="mockup-user">Admin</div>
            </div>
            <div className="mockup-content">
              <div className="mockup-stats">
                <div className="mockup-stat-card">
                  <h4>Total Employees</h4>
                  <p>1,245</p>
                </div>
                <div className="mockup-stat-card">
                  <h4>Active Projects</h4>
                  <p>86</p>
                </div>
                <div className="mockup-stat-card">
                  <h4>Documents Indexed</h4>
                  <p>14,302</p>
                </div>
                <div className="mockup-stat-card">
                  <h4>Knowledge Nodes</h4>
                  <p>54,192</p>
                </div>
              </div>
              
              <div className="mockup-recent">
                <h3>Recent Activity</h3>
                <div className="mockup-list">
                  <div className="mockup-list-item">New relationship discovered in Project Alpha</div>
                  <div className="mockup-list-item">Financial Q3 Report uploaded by John Doe</div>
                  <div className="mockup-list-item">AI Assistant answered 42 queries today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPreview;
