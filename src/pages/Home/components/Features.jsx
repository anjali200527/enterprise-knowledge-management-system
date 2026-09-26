import React from 'react';
import SpotlightCard from '../../../components/SpotlightCard/SpotlightCard';
import './Features.css';
import { FaDatabase, FaRobot, FaProjectDiagram, FaFileInvoice, FaUsersCog, FaChartLine } from 'react-icons/fa';

const Features = () => {
  const featureList = [
    {
      title: 'Knowledge Management',
      description: 'Centralize and organize enterprise information, documents and organizational knowledge in one platform.',
      icon: <FaDatabase />
    },
    {
      title: 'AI Assistant',
      description: 'Interact with enterprise knowledge through an intelligent assistant that helps users find relevant information faster.',
      icon: <FaRobot />
    },
    {
      title: 'Knowledge Graph',
      description: 'Visualize connections between employees, projects, documents and organizational relationships.',
      icon: <FaProjectDiagram />
    },
    {
      title: 'Document Intelligence',
      description: 'Manage enterprise documents and make important organizational information easier to discover.',
      icon: <FaFileInvoice />
    },
    {
      title: 'Relationship Intelligence',
      description: 'Understand how employees, projects and documents are connected across the organization.',
      icon: <FaUsersCog />
    },
    {
      title: 'Enterprise Insights',
      description: 'Explore organizational information through dashboards, reports and connected knowledge.',
      icon: <FaChartLine />
    }
  ];

  return (
    <section id="features" className="home-features">
      <div className="features-header">
        <h2>Powerful Features for Smarter Knowledge</h2>
        <p className="features-subtitle">Everything you need to organize, connect and explore enterprise knowledge.</p>
      </div>
      
      <div className="features-grid">
        {featureList.map((feature, idx) => (
          <SpotlightCard key={idx} className="feature-card" spotlightColor="rgba(255, 255, 255, 0.10)">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};

export default Features;
