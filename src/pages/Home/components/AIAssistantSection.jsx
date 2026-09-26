import React from 'react';
import './AIAssistantSection.css';
import { FaUserCircle, FaRobot } from 'react-icons/fa';

const AIAssistantSection = () => {
  return (
    <section className="ai-assistant-section">
      <div className="ai-container">
        <h2 className="ai-title">Ask Your Enterprise Knowledge Anything</h2>
        <p className="ai-description">
          Ask questions about your organization's knowledge and get relevant answers with the AI Assistant.
        </p>
        
        <div className="ai-chat-preview">
          <div className="chat-window">
            <div className="chat-message user-message">
              <div className="message-icon"><FaUserCircle /></div>
              <div className="message-bubble">
                Who is working on the current project?
              </div>
            </div>
            
            <div className="chat-message ai-message">
              <div className="message-icon"><FaRobot /></div>
              <div className="message-bubble">
                Here are the employees associated with the project...
              </div>
            </div>
            
            <div className="chat-message user-message">
              <div className="message-icon"><FaUserCircle /></div>
              <div className="message-bubble">
                What documents are related to this project?
              </div>
            </div>
            
            <div className="chat-message ai-message">
              <div className="message-icon"><FaRobot /></div>
              <div className="message-bubble">
                I found the following related documents...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;
