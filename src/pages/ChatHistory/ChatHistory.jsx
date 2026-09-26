import "./ChatHistory.css";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  FaComments,
  FaSearch,
  FaTrash,
  FaTimes,
  FaEye,
  FaHistory,
} from "react-icons/fa";


import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import API_URL from "../../config/api";

// =================================================
// CHAT HISTORY
// =================================================

function ChatHistory() {
  const CHAT_API_URL = `${API_URL}/api/chats`;

  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedChat, setSelectedChat] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // =================================================
  // GET LOGGED-IN USER
  // =================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  };

  // =================================================
  // GET USER ID
  // =================================================

  const getUserId = () => {
    const user = getLoggedInUser();

    if (!user) {
      return null;
    }

    return user._id || user.id || user.userId || null;
  };

  // =================================================
  // AUTH CONFIG
  // =================================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =================================================
  // FETCH CHAT HISTORY
  // =================================================

  const fetchChats = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const userId = getUserId();

      if (!userId) {
        setErrorMessage("User ID is required. Please login again.");

        return;
      }

      const response = await axios.get(CHAT_API_URL, {
        ...getAuthConfig(),

        params: {
          userId: String(userId),
        },
      });

      let chatData = [];

      if (Array.isArray(response.data)) {
        chatData = response.data;
      } else if (Array.isArray(response.data?.chats)) {
        chatData = response.data.chats;
      } else if (Array.isArray(response.data?.data)) {
        chatData = response.data.data;
      }

      setChats(chatData);
      setFilteredChats(chatData);
    } catch (error) {
      console.error("Fetch Chat History Error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch chat history.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // LOAD CHAT HISTORY
  // =================================================

  useEffect(() => {
    fetchChats();
  }, []);

  // =================================================
  // SEARCH CHAT HISTORY
  // =================================================

  useEffect(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter((chat) => {
      const question = chat.question || chat.query || chat.message || "";

      const answer = chat.answer || chat.response || "";

      return (
        String(question).toLowerCase().includes(search) ||
        String(answer).toLowerCase().includes(search)
      );
    });

    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  // =================================================
  // DELETE SINGLE CHAT
  // =================================================

  const deleteChat = async (chatId) => {
    if (!chatId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this chat?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const userId = getUserId();

      if (!userId) {
        alert("User ID is required. Please login again.");
        return;
      }

      await axios.delete(`${CHAT_API_URL}/${chatId}`, {
        ...getAuthConfig(),

        params: {
          userId: String(userId),
        },
      });

      const updatedChats = chats.filter(
        (chat) => String(chat._id || chat.id) !== String(chatId),
      );

      setChats(updatedChats);
      setFilteredChats(updatedChats);

      if (
        selectedChat &&
        String(selectedChat._id || selectedChat.id) === String(chatId)
      ) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Delete Chat Error:", error);

      alert(error.response?.data?.message || "Failed to delete chat.");
    }
  };

  // =================================================
  // CLEAR ALL CHAT HISTORY
  // =================================================

  const clearAllChats = async () => {
    if (chats.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all chat history?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const userId = getUserId();

      if (!userId) {
        alert("User ID is required. Please login again.");
        return;
      }

      await axios.delete(`${CHAT_API_URL}/clear`, {
        ...getAuthConfig(),

        params: {
          userId: String(userId),
        },
      });

      setChats([]);
      setFilteredChats([]);
      setSelectedChat(null);
    } catch (error) {
      console.error("Clear Chat History Error:", error);

      alert(error.response?.data?.message || "Failed to clear chat history.");
    }
  };

  // =================================================
  // FORMAT DATE
  // =================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  // =================================================
  // GET QUESTION
  // =================================================

  const getQuestion = (chat) => {
    return (
      chat.question || chat.query || chat.message || "Untitled conversation"
    );
  };

  // =================================================
  // GET ANSWER
  // =================================================

  const getAnswer = (chat) => {
    return chat.answer || chat.response || "No response available.";
  };

  // =================================================
  // RENDER
  // =================================================

  return (
    <div className="chat-history-dashboard">
      {/* SIDEBAR */}

      

      {/* MAIN */}

      <div className="chat-history-main">
        {/* NAVBAR */}

        <Navbar />

        {/* PAGE */}

        <div className="chat-history-page">
          {/* HEADER */}

          <div className="chat-history-header">
            <div className="chat-history-title">
              <div className="chat-history-title-icon">
                <FaHistory />
              </div>

              <div>
                <h1>Chat History</h1>

                <p>View and manage your previous AI Assistant conversations.</p>
              </div>
            </div>

            {chats.length > 0 && (
              <button
                type="button"
                className="clear-history-btn"
                onClick={clearAllChats}
              >
                <FaTrash />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {/* SEARCH */}

          <div className="chat-search-box">
            <FaSearch />

            <input
              type="text"
              placeholder="Search chat history..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* CONTENT */}

          {loading ? (
            <div className="chat-history-status">
              <div className="chat-loader"></div>

              <p>Loading chat history...</p>
            </div>
          ) : errorMessage ? (
            <div className="chat-history-error">
              <p>{errorMessage}</p>

              <button type="button" onClick={fetchChats}>
                Try Again
              </button>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="chat-history-empty">
              <div className="empty-chat-icon">
                <FaComments />
              </div>

              <h2>{searchTerm ? "No chats found" : "No chat history yet"}</h2>

              <p>
                {searchTerm
                  ? "Try a different search term."
                  : "Your AI Assistant conversations will appear here."}
              </p>
            </div>
          ) : (
            <div className="chat-history-content">
              {/* SUMMARY */}

              <div className="chat-history-summary">
                <div>
                  <FaComments />

                  <span>
                    {filteredChats.length}{" "}
                    {filteredChats.length === 1
                      ? "Conversation"
                      : "Conversations"}
                  </span>
                </div>
              </div>

              {/* CHAT LIST */}

              <div className="chat-list">
                {filteredChats.map((chat, index) => {
                  const chatId = chat._id || chat.id;

                  return (
                    <div className="chat-card" key={chatId || `chat-${index}`}>
                      {/* ICON */}

                      <div className="chat-card-icon">
                        <FaComments />
                      </div>

                      {/* CONTENT */}

                      <div className="chat-card-content">
                        <h3>{getQuestion(chat)}</h3>

                        <p>{getAnswer(chat)}</p>

                        <span className="chat-date">
                          {formatDate(
                            chat.createdAt || chat.created_at || chat.date,
                          )}
                        </span>
                      </div>

                      {/* ACTIONS */}

                      <div className="chat-card-actions">
                        <button
                          type="button"
                          className="view-chat-btn"
                          title="View conversation"
                          onClick={() => setSelectedChat(chat)}
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="delete-chat-btn"
                          title="Delete conversation"
                          onClick={() => deleteChat(chatId)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <Footer />
      </div>

      {/* =================================================
          VIEW CHAT MODAL
      ================================================= */}

      {selectedChat && (
        <div
          className="chat-modal-overlay"
          onClick={() => setSelectedChat(null)}
        >
          <div
            className="chat-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="chat-modal-header">
              <div>
                <FaComments />

                <h2>Conversation</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedChat(null)}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="chat-modal-body">
              <div className="chat-message question">
                <span className="message-label">You</span>

                <p>{getQuestion(selectedChat)}</p>
              </div>

              <div className="chat-message answer">
                <span className="message-label">AI Assistant</span>

                <p>{getAnswer(selectedChat)}</p>
              </div>

              <div className="modal-chat-date">
                {formatDate(
                  selectedChat.createdAt ||
                    selectedChat.created_at ||
                    selectedChat.date,
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatHistory;
