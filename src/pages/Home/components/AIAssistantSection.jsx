import React from 'react';
import './AIAssistantSection.css';
import { FaUserCircle, FaRobot } from 'react-icons/fa';

const AIAssistantSection = () => {
  return (
    <section className="ai-assistant-section">
      <div className="ai-container">
        <h2 className="ai-title">Ask Your Enterprise Knowledge Anything.</h2>
        
        <div className="ai-chat-preview">
          <div className="chat-window">
            <div className="chat-message user-message">
              <div className="message-icon"><FaUserCircle /></div>
              <div className="message-bubble">
                Which employees are connected to Project Alpha?
              </div>
            </div>
            
            <div className="chat-message ai-message">
              <div className="message-icon"><FaRobot /></div>
              <div className="message-bubble">
                Project Alpha is connected to the following employees: Sarah Jenkins (Lead Developer), Michael Chang (Product Manager), and David Silva (UX Designer).
              </div>
            </div>
            
            <div className="chat-message user-message">
              <div className="message-icon"><FaUserCircle /></div>
              <div className="message-bubble">
                Which documents are related to this project?
              </div>
            </div>
            
            <div className="chat-message ai-message">
              <div className="message-icon"><FaRobot /></div>
              <div className="message-bubble">
                Here are the documents currently associated with the project: "Q3 Alpha Roadmap v2.pdf", "Alpha Architecture Diagram.png", and "Security Audit - Alpha.docx".
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;
