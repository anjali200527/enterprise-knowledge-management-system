import "./Support.css";
import {
  FaArrowLeft,
  FaTools,
  FaLock,
  FaFileUpload,
  FaRobot,
  FaProjectDiagram,
  FaPaperPlane,
  FaQuestionCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Support() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    priority: "Medium",
    subject: "",
    description: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    setFormData({
      category: "",
      priority: "Medium",
      subject: "",
      description: "",
    });
  };

  const supportItems = [
    {
      icon: <FaTools />,
      title: "Technical Issues",
      text: "Report problems related to application functionality, errors, or system performance.",
    },
    {
      icon: <FaLock />,
      title: "Login & Account",
      text: "Get assistance with login, authentication, account access, or permission-related issues.",
    },
    {
      icon: <FaFileUpload />,
      title: "Document Upload",
      text: "Report problems related to document uploads, processing, or document retrieval.",
    },
    {
      icon: <FaRobot />,
      title: "AI Assistant",
      text: "Get help with AI Assistant responses, enterprise knowledge retrieval, or AI-related issues.",
    },
    {
      icon: <FaProjectDiagram />,
      title: "Knowledge Graph",
      text: "Report issues related to graph visualization, entities, or relationships.",
    },
  ];

  return (
    <div className="support-page">
      {/* HEADER */}
      <header className="support-header">
        <div>
          <span className="support-label">SUPPORT CENTER</span>

          <h1>How Can We Support You?</h1>

          <p>
            Get assistance with the Enterprise Knowledge Management System and
            report issues to the support team.
          </p>
        </div>

        <button
          type="button"
          className="support-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
      </header>

      <main className="support-content">
        {/* WELCOME */}
        <section className="support-welcome">
          <div className="support-welcome-icon">
            <FaQuestionCircle />
          </div>

          <div>
            <h2>Welcome to EKMS Support</h2>

            <p>
              If you are facing a technical problem or need help using any EKMS
              feature, submit a support request below.
            </p>
          </div>
        </section>

        {/* SUPPORT CATEGORIES */}
        <section className="support-section">
          <div className="support-section-heading">
            <span className="support-label">SUPPORT AREAS</span>

            <h2>What Do You Need Help With?</h2>

            <p>Choose the area that best matches your issue.</p>
          </div>

          <div className="support-grid">
            {supportItems.map((item, index) => (
              <div className="support-card" key={index}>
                <div className="support-card-icon">{item.icon}</div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SUPPORT REQUEST FORM */}
        <section className="support-form-section">
          <div className="support-form-heading">
            <span className="support-label">SUPPORT REQUEST</span>

            <h2>Submit a Support Request</h2>

            <p>
              Provide the details below so the support team can understand and
              review your issue.
            </p>
          </div>

          <form className="support-form" onSubmit={handleSubmit}>
            <div className="support-form-row">
              <div className="support-form-group">
                <label htmlFor="category">Issue Category</label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an issue category</option>

                  <option value="Technical Issues">Technical Issues</option>

                  <option value="Login & Account">Login & Account</option>

                  <option value="Document Upload">Document Upload</option>

                  <option value="AI Assistant">AI Assistant</option>

                  <option value="Knowledge Graph">Knowledge Graph</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="support-form-group">
                <label htmlFor="priority">Priority</label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="support-form-group">
              <label htmlFor="subject">Subject</label>

              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Briefly describe your issue"
                required
              />
            </div>

            <div className="support-form-group">
              <label htmlFor="description">Issue Description</label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows="7"
                required
              />
            </div>

            <button type="submit" className="support-submit-button">
              <FaPaperPlane />
              <span>Submit Support Request</span>
            </button>

            {submitted && (
              <div className="support-success-message">
                Your support request has been submitted successfully.
              </div>
            )}
          </form>
        </section>

        {/* QUICK LINKS */}
        <section className="support-quick-links">
          <h2>Need More Information?</h2>

          <p>
            You can also visit our Help Center or Contact Us page for additional
            assistance.
          </p>

          <div className="support-action-buttons">
            <button type="button" onClick={() => navigate("/help")}>
              Help Center
            </button>

            <button type="button" onClick={() => navigate("/contact")}>
              Contact Us
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="support-footer">
        <p>
          © {new Date().getFullYear()} Enterprise Knowledge Management System
        </p>

        <span>Knowledge • Collaboration • Intelligence</span>
      </footer>
    </div>
  );
}

export default Support;
