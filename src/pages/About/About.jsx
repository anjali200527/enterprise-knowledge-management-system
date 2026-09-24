import "./About.css";
import {
  FaUsers,
  FaFileAlt,
  FaProjectDiagram,
  FaRobot,
  FaDatabase,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* ================= HEADER ================= */}

      <header className="about-header">
        <div>
          <h1>About Enterprise Knowledge Management System</h1>
          <p>Connecting People, Knowledge and Intelligence</p>
        </div>

        <button
          type="button"
          className="about-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
      </header>

      {/* ================= ABOUT ================= */}

      <section className="about-section about-intro">
        <div className="about-section-content">
          <span className="about-label">ABOUT EKMS</span>

          <h2>Enterprise Knowledge Management System</h2>

          <p>
            Enterprise Knowledge Management System (EKMS) is a centralized
            platform designed to help organizations store, manage, discover, and
            share knowledge efficiently.
          </p>

          <p>
            EKMS brings together employees, projects, documents, relationships,
            and organizational knowledge into a unified system. It also uses
            Artificial Intelligence and Knowledge Graph technologies to make
            enterprise information easier to access and understand.
          </p>
        </div>
      </section>

      {/* ================= PURPOSE ================= */}

      <section className="about-section purpose-section">
        <div className="section-heading">
          <span className="about-label">OUR PURPOSE</span>

          <h2>Making Enterprise Knowledge Accessible</h2>

          <p>
            EKMS is designed to improve how organizations create, organize,
            retrieve, and share knowledge.
          </p>
        </div>

        <div className="purpose-grid">
          <div className="purpose-card">
            <FaDatabase />
            <h3>Centralized Knowledge</h3>
            <p>
              Organize enterprise information in one centralized platform for
              easier access and management.
            </p>
          </div>

          <div className="purpose-card">
            <FaUsers />
            <h3>Better Collaboration</h3>
            <p>
              Connect employees with projects, documents, and organizational
              knowledge.
            </p>
          </div>

          <div className="purpose-card">
            <FaRobot />
            <h3>AI-Powered Assistance</h3>
            <p>
              Use AI to help users discover and understand relevant enterprise
              information.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section className="about-section features-section">
        <div className="section-heading">
          <span className="about-label">KEY FEATURES</span>

          <h2>Everything in One Platform</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>

            <h3>Employee Management</h3>

            <p>
              Manage employee information, roles, and organizational access
              efficiently.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaFileAlt />
            </div>

            <h3>Document Management</h3>

            <p>
              Upload, organize, process, and retrieve important enterprise
              documents.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaProjectDiagram />
            </div>

            <h3>Knowledge Graph</h3>

            <p>
              Visualize connections between employees, projects, documents, and
              other enterprise entities.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaRobot />
            </div>

            <h3>AI Assistant</h3>

            <p>
              Interact with enterprise knowledge using AI-powered question
              answering and retrieval.
            </p>
          </div>
        </div>
      </section>

      {/* ================= TECHNOLOGY ================= */}

      <section className="about-section technology-section">
        <div className="section-heading">
          <span className="about-label">TECHNOLOGY</span>

          <h2>Built With Modern Technologies</h2>

          <p>
            EKMS combines modern web technologies, databases, artificial
            intelligence, and knowledge graph technology.
          </p>
        </div>

        <div className="technology-list">
          <span>React + Vite</span>
          <span>Node.js</span>
          <span>Express.js</span>
          <span>MongoDB</span>
          <span>Neo4j</span>
          <span>RAG</span>
          <span>Embeddings</span>
          <span>Gemini AI</span>
        </div>
      </section>

      {/* ================= BENEFITS ================= */}

      <section className="about-section benefits-section">
        <div className="section-heading">
          <span className="about-label">BENEFITS</span>

          <h2>Why EKMS?</h2>
        </div>

        <div className="benefits-grid">
          <div>
            <strong>01</strong>
            <h3>Faster Information Retrieval</h3>
            <p>Find relevant enterprise information quickly.</p>
          </div>

          <div>
            <strong>02</strong>
            <h3>Improved Knowledge Sharing</h3>
            <p>Make organizational knowledge easier to share.</p>
          </div>

          <div>
            <strong>03</strong>
            <h3>Organized Enterprise Data</h3>
            <p>Connect and organize information across the organization.</p>
          </div>

          <div>
            <strong>04</strong>
            <h3>AI-Assisted Knowledge Discovery</h3>
            <p>Use AI to explore and understand enterprise knowledge.</p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="about-footer">
        <p>
          © {new Date().getFullYear()} Enterprise Knowledge Management System
        </p>

        <span>Knowledge • Collaboration • Intelligence</span>
      </footer>
    </div>
  );
}

export default About;
