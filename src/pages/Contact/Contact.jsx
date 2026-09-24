import "./Contact.css";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
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
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      {/* HEADER */}
      <header className="contact-header">
        <div>
          <span className="contact-label">CONTACT US</span>

          <h1>Get in Touch With Us</h1>

          <p>
            Have a question or need assistance with the Enterprise Knowledge
            Management System?
          </p>
        </div>

        <button
          type="button"
          className="contact-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
      </header>

      <main className="contact-content">
        {/* INTRO */}
        <section className="contact-intro">
          <span className="contact-label">WE ARE HERE TO HELP</span>

          <h2>Let's Connect</h2>

          <p>
            Reach out to us for questions, technical assistance, feedback, or
            any other information related to EKMS.
          </p>
        </section>

        {/* CONTACT INFORMATION */}
        <section className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FaEnvelope />
            </div>

            <h3>Email</h3>

            <p>support@ekms.com</p>

            <span>Send us your questions anytime.</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FaPhone />
            </div>

            <h3>Phone</h3>

            <p>+91 98765 43210</p>

            <span>Available during support hours.</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FaMapMarkerAlt />
            </div>

            <h3>Office</h3>

            <p>Enterprise Knowledge Center</p>

            <span>India</span>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FaClock />
            </div>

            <h3>Support Hours</h3>

            <p>Monday – Friday</p>

            <span>9:00 AM – 6:00 PM</span>
          </div>
        </section>

        {/* CONTACT FORM */}
        <section className="contact-form-section">
          <div className="contact-form-heading">
            <span className="contact-label">SEND A MESSAGE</span>

            <h2>How Can We Help?</h2>

            <p>
              Fill in the form below and our support team can review your
              request.
            </p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="contact-form-group">
                <label htmlFor="name">Name</label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="contact-form-group">
              <label htmlFor="subject">Subject</label>

              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter the subject"
                required
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="message">Message</label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows="6"
                required
              />
            </div>

            <button type="submit" className="contact-submit-button">
              <FaPaperPlane />
              <span>Send Message</span>
            </button>

            {submitted && (
              <div className="contact-success-message">
                Your message has been submitted successfully.
              </div>
            )}
          </form>
        </section>

        {/* SUPPORT */}
        <section className="contact-support">
          <h2>Need Technical Support?</h2>

          <p>
            For technical problems, account issues, or access-related questions,
            please contact the support team.
          </p>

          <button type="button" onClick={() => navigate("/help")}>
            Visit Help Center
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="contact-footer">
        <p>
          © {new Date().getFullYear()} Enterprise Knowledge Management System
        </p>

        <span>Knowledge • Collaboration • Intelligence</span>
      </footer>
    </div>
  );
}

export default Contact;
