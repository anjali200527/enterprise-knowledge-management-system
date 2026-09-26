import "./AIAssistant.css";
import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from "react-icons/fa";
import axios from "axios";
import API_URL from "../../config/api";
import aiAssistantImage from "../../assets/ai-assistant.jpg";
import Navbar from "../../components/Navbar/Navbar";

function AIAssistant() {
  const AI_API_URL = `${API_URL}/api/ai/ask`;
  const CHAT_API_URL = `${API_URL}/api/chats`;

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your KnowSphere AI Assistant. You can ask me about Employees, Projects, Documents, Relationships, and the Knowledge Graph.",
    },
  ]);
  const messagesEndRef = useRef(null);

  const getUserId = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      const user = JSON.parse(storedUser);
      return user?._id || user?.id || user?.userId || null;
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveChatHistory = async (userQuestion, aiAnswer) => {
    try {
      const userId = getUserId();
      if (!userId) return;
      await axios.post(CHAT_API_URL, { userId, question: userQuestion, answer: aiAnswer }, getAuthConfig());
    } catch (error) {
      console.error("Save Chat History Error:", error.response?.data?.message || error.message);
    }
  };

  const sendQuestion = async (questionText) => {
    if (!questionText || !questionText.trim() || loading) return;
    const userQuestion = questionText.trim();

    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setQuestion("");

    try {
      setLoading(true);
      const response = await axios.post(AI_API_URL, { question: userQuestion }, getAuthConfig());
      const aiAnswer = response.data?.answer || "Sorry, I could not find an answer.";
      
      setMessages((prev) => [...prev, { sender: "ai", text: aiAnswer }]);
      await saveChatHistory(userQuestion, aiAnswer);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMessage = error.response?.data?.message || "Sorry, something went wrong while processing your question.";
      setMessages((prev) => [...prev, { sender: "ai", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async (event) => {
    event.preventDefault();
    await sendQuestion(question);
  };

  const askQuickQuestion = async (quickQuestion) => {
    await sendQuestion(quickQuestion);
  };

  return (
    <div className="ai-page-wrapper">
      <Navbar />
      
      <main className="ai-main-content">
        <div className="ai-container">
          
          <div className="ai-header">
            <div className="ai-title">
              <div className="ai-icon"><FaRobot /></div>
              <div>
                <h2>AI Assistant</h2>
                <p>Intelligent enterprise knowledge assistance</p>
              </div>
            </div>
            <div className="ai-status"><span></span>Online</div>
          </div>

          <div className="quick-question-section">
            <p>Try asking:</p>
            <div className="quick-question-buttons">
              <button type="button" disabled={loading} onClick={() => askQuickQuestion("List employees")}>List Employees</button>
              <button type="button" disabled={loading} onClick={() => askQuickQuestion("Show projects")}>Show Projects</button>
              <button type="button" disabled={loading} onClick={() => askQuickQuestion("List documents")}>List Documents</button>
              <button type="button" disabled={loading} onClick={() => askQuickQuestion("Give system overview")}>System Overview</button>
            </div>
          </div>

          <div className="ai-content-split">
            <div className="ai-chat-box">
              <div className="ai-messages">
                {messages.map((message, index) => (
                  <div key={index} className={message.sender === "user" ? "message user-message" : "message ai-message"}>
                    <div className="message-icon">
                      {message.sender === "user" ? <FaUser /> : <FaRobot />}
                    </div>
                    <div className="message-content">
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="message ai-message">
                    <div className="message-icon"><FaRobot /></div>
                    <div className="message-content typing">
                      <FaSpinner className="spinner-icon" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}></div>
              </div>

              <form className="ai-input-section" onSubmit={handleAskAI}>
                <input
                  type="text"
                  placeholder="Ask something about your enterprise knowledge..."
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !question.trim()} title="Send Question">
                  {loading ? <FaSpinner className="spinner-icon" /> : <FaPaperPlane />}
                </button>
              </form>
            </div>

            <div className="ai-robot-visual-container">
              <img src={aiAssistantImage} alt="Enterprise AI Assistant" className="ai-robot-image" />
              <div className="ai-robot-visual-text">
                <h3>Ask your enterprise AI</h3>
                <p>Your intelligent assistant is ready to help you navigate KnowSphere efficiently.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AIAssistant;
