import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Connect',
      desc: 'Bring employees, projects, documents and organizational information together.'
    },
    {
      step: '02',
      title: 'Organize',
      desc: 'Structure enterprise information and establish meaningful relationships.'
    },
    {
      step: '03',
      title: 'Understand',
      desc: 'Use AI assistance and connected data to explore organizational knowledge.'
    },
    {
      step: '04',
      title: 'Discover',
      desc: 'Find insights through dashboards, reports and the Knowledge Graph.'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="hiw-container">
        <div className="hiw-header">
          <h2 className="hiw-title">How KnowSphere Works</h2>
          <p className="hiw-subtitle">Connect organizational information and turn it into accessible enterprise knowledge.</p>
        </div>
        
        <div className="hiw-steps">
          {steps.map((item, idx) => (
            <div className="hiw-step-card" key={idx}>
              <div className="hiw-step-number">{item.step}</div>
              <h3 className="hiw-step-title">{item.title}</h3>
              <p className="hiw-step-desc">{item.desc}</p>
              {idx < steps.length - 1 && <div className="hiw-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
