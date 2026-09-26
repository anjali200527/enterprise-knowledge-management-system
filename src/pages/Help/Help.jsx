import "./Help.css";
import Navbar from "../../components/Navbar/Navbar";
import {
  FaArrowLeft,
  FaTachometerAlt,
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
  FaSitemap,
  FaRobot,
  FaHistory,
  FaChartBar,
  FaCog,
  FaQuestionCircle,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Help() {
  const navigate = useNavigate();
  
  const helpItems = [
    {
      icon: <FaTachometerAlt />,
      title: "Dashboard",
      text: "Use the dashboard to access the main modules and view important enterprise information.",
    },
    {
      icon: <FaUsers />,
      title: "Employees",
      text: "View and manage employee information according to your assigned role and permissions.",
    },
    {
      icon: <FaProjectDiagram />,
      title: "Projects",
      text: "Create, view, update, and manage organizational projects.",
    },
    {
      icon: <FaFileAlt />,
      title: "Documents",
      text: "Upload and manage enterprise documents. Documents can be processed for knowledge retrieval.",
    },
    {
      icon: <FaSitemap />,
      title: "Knowledge Graph",
      text: "Explore relationships between employees, projects, documents, and other enterprise entities.",
    },
    {
      icon: <FaRobot />,
      title: "AI Assistant",
      text: "Ask questions about enterprise knowledge and receive AI-assisted answers from available information.",
    },
    {
      icon: <FaHistory />,
      title: "Chat History",
      text: "View previous AI Assistant conversations and manage your saved chat history.",
    },
    {
      icon: <FaChartBar />,
      title: "Reports",
      text: "Access organizational reports and information available according to your role.",
    },
    {
      icon: <FaCog />,
      title: "Settings",
      text: "Manage available application preferences and account-related settings.",
    },
  ];

  return (
    <div className="help-page-wrapper">
      <Navbar />
      
      
      <main className="help-main-area">
        <header className="help-header">
          <div className="help-header-left">
            
            <div>
              <span className="help-label">HELP & USER GUIDE</span>
              <h1>How Can We Help You?</h1>
              <p>Find answers and get support for KnowSphere.</p>
            </div>
          </div>

          <button
            type="button"
            className="help-back-button"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
        </header>

        <div className="help-content">
          <section className="help-welcome">
            <div className="help-welcome-icon">
              <FaQuestionCircle />
            </div>
            <div>
              <h2>Welcome to KnowSphere Help Center</h2>
              <p>This guide provides a quick overview of the major features available in KnowSphere.</p>
            </div>
          </section>

          <section className="help-section">
            <div className="help-section-heading">
              <span className="help-label">MODULE GUIDE</span>
              <h2>Using KnowSphere</h2>
              <p>Select a module below to understand its purpose and usage.</p>
            </div>
            <div className="help-grid">
              {helpItems.map((item, index) => (
                <div className="help-card" key={index}>
                  <div className="help-card-icon">{item.icon}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="help-section quick-help-section">
            <div className="help-section-heading">
              <span className="help-label">QUICK HELP</span>
              <h2>Common Questions</h2>
            </div>
            <div className="faq-list">
              <div className="faq-item">
                <h3>How do I access the system?</h3>
                <p>Log in using your registered account. Your available modules depend on your assigned role.</p>
              </div>
              <div className="faq-item">
                <h3>Why can't I access a particular module?</h3>
                <p>Some features are restricted according to user roles and permissions. Contact an administrator if access is required.</p>
              </div>
              <div className="faq-item">
                <h3>How does the AI Assistant work?</h3>
                <p>The AI Assistant uses available enterprise information, document retrieval, and AI capabilities to answer relevant questions.</p>
              </div>
              <div className="faq-item">
                <h3>Where can I get additional support?</h3>
                <p>If you cannot resolve an issue using this guide, contact the support team through the Contact Us section.</p>
              </div>
            </div>
          </section>

          <section className="help-support">
            <h2>Still Need Help?</h2>
            <p>If you need additional assistance, our support section can help you with system-related questions and issues.</p>
            <button type="button" onClick={() => navigate("/contact")}>
              Contact Support
            </button>
          </section>
        </div>

        <footer className="help-footer">
          <p>© {new Date().getFullYear()} KnowSphere</p>
          <span>Knowledge • Collaboration • Intelligence</span>
        </footer>
      </main>
    </div>
  );
}

export default Help;
