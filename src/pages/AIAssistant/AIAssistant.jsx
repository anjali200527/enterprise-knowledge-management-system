import "./AIAssistant.css";

import { useEffect, useRef, useState } from "react";

import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from "react-icons/fa";

import axios from "axios";

import API_URL from "../../config/api";

function AIAssistant() {
  // ============================================
  // API URLS
  // ============================================

  const AI_API_URL = `${API_URL}/api/ai/ask`;
  const CHAT_API_URL = `${API_URL}/api/chats`;

  // ============================================
  // STATES
  // ============================================

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text:
        "Hello! I am your Enterprise Knowledge Management AI Assistant. " +
        "You can ask me about Employees, Projects, Documents, Relationships, " +
        "and the Knowledge Graph.",
    },
  ]);

  const messagesEndRef = useRef(null);

  // ============================================
  // GET LOGGED-IN USER ID
  // ============================================

  const getUserId = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser);

      return user?._id || user?.id || user?.userId || null;
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  };

  // ============================================
  // AUTH CONFIG
  // ============================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ============================================
  // AUTO SCROLL
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ============================================
  // SAVE CHAT HISTORY
  // ============================================

  const saveChatHistory = async (userQuestion, aiAnswer) => {
    try {
      const userId = getUserId();

      if (!userId) {
        console.error("Cannot save chat: User ID is missing.");
        return;
      }

      await axios.post(
        CHAT_API_URL,
        {
          userId: userId,
          question: userQuestion,
          answer: aiAnswer,
        },
        getAuthConfig(),
      );

      console.log("Chat history saved successfully.");
    } catch (error) {
      // Chat saving failure should not stop AI response
      console.error(
        "Save Chat History Error:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // ============================================
  // SEND QUESTION
  // ============================================

  const sendQuestion = async (questionText) => {
    if (!questionText || !questionText.trim() || loading) {
      return;
    }

    const userQuestion = questionText.trim();

    // ==========================================
    // ADD USER MESSAGE
    // ==========================================

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");

    try {
      setLoading(true);

      // ========================================
      // ASK AI
      // ========================================

      const response = await axios.post(
        AI_API_URL,
        {
          question: userQuestion,
        },
        getAuthConfig(),
      );

      const aiAnswer =
        response.data?.answer || "Sorry, I could not find an answer.";

      // ========================================
      // ADD AI RESPONSE
      // ========================================

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "ai",
          text: aiAnswer,
        },
      ]);

      // ========================================
      // SAVE QUESTION + ANSWER
      // ========================================

      await saveChatHistory(userQuestion, aiAnswer);
    } catch (error) {
      console.error("AI Assistant Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Sorry, something went wrong while processing your question.";

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "ai",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FORM SUBMIT
  // ============================================

  const handleAskAI = async (event) => {
    event.preventDefault();

    await sendQuestion(question);
  };

  // ============================================
  // QUICK QUESTION
  // ============================================

  const askQuickQuestion = async (quickQuestion) => {
    await sendQuestion(quickQuestion);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="ai-container">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="ai-header">
        <div className="ai-title">
          <div className="ai-icon">
            <FaRobot />
          </div>

          <div>
            <h2>AI Knowledge Assistant</h2>

            <p>Ask questions about your enterprise knowledge.</p>
          </div>
        </div>

        <div className="ai-status">
          <span></span>
          Online
        </div>
      </div>

      {/* ======================================
          QUICK QUESTIONS
      ====================================== */}

      <div className="quick-question-section">
        <p>Try asking:</p>

        <div className="quick-question-buttons">
          <button
            type="button"
            disabled={loading}
            onClick={() => askQuickQuestion("List employees")}
          >
            List Employees
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => askQuickQuestion("Show projects")}
          >
            Show Projects
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => askQuickQuestion("List documents")}
          >
            List Documents
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => askQuickQuestion("Give system overview")}
          >
            System Overview
          </button>
        </div>
      </div>

      {/* ======================================
          CHAT BOX
      ====================================== */}

      <div className="ai-chat-box">
        {/* ====================================
            MESSAGES
        ==================================== */}

        <div className="ai-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sender === "user"
                  ? "message user-message"
                  : "message ai-message"
              }
            >
              {/* MESSAGE ICON */}

              <div className="message-icon">
                {message.sender === "user" ? <FaUser /> : <FaRobot />}
              </div>

              {/* MESSAGE CONTENT */}

              <div className="message-content">
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {/* ==================================
              THINKING
          ================================== */}

          {loading && (
            <div className="message ai-message">
              <div className="message-icon">
                <FaRobot />
              </div>

              <div className="message-content typing">
                <FaSpinner />

                <span>Thinking...</span>
              </div>
            </div>
          )}

          {/* AUTO SCROLL */}

          <div ref={messagesEndRef}></div>
        </div>

        {/* ====================================
            INPUT
        ==================================== */}

        <form className="ai-input-section" onSubmit={handleAskAI}>
          <input
            type="text"
            placeholder="Ask something about your enterprise knowledge..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            title="Send Question"
          >
            {loading ? <FaSpinner /> : <FaPaperPlane />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;
