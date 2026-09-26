import React from 'react';
import './KnowledgeGraphVisual.css';
import { FaUser, FaProjectDiagram, FaFileAlt, FaLink } from 'react-icons/fa';

const KnowledgeGraphVisual = () => {
  return (
    <section className="kg-visual-section">
      <div className="kg-container">
        <h2 className="kg-title">See How Your Knowledge Connects</h2>
        
        <div className="kg-abstract-visual">
          <div className="kg-node employee-node">
            <FaUser />
            <span>Employee</span>
          </div>
          
          <div className="kg-line line-ep"></div>
          
          <div className="kg-node project-node">
            <FaProjectDiagram />
            <span>Project</span>
          </div>
          
          <div className="kg-line line-pd"></div>
          
          <div className="kg-node document-node">
            <FaFileAlt />
            <span>Document</span>
          </div>
          
          <div className="kg-line line-er"></div>
          
          <div className="kg-node relation-node">
            <FaLink />
            <span>Relationship</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeGraphVisual;
