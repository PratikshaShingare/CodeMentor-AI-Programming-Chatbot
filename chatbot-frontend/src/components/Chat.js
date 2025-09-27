import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Chat.css';

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(null);
  const [renamingConversation, setRenamingConversation] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const messagesEndRef = useRef(null);

  const { user, logout, updatePreferences } = useAuth();

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('http://localhost:5000/api/conversations');
      const conversationsData = response.data.conversations || [];
      setConversations(conversationsData);
      
      if (conversationsData.length > 0 && !activeConversation) {
        setActiveConversation(conversationsData[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  }, [user, activeConversation]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/conversations/${conversationId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversation?.id) {
      loadMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/conversations', {
        title: 'New Chat'
      });
      
      const newConversation = response.data.conversation;
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setShowConversationMenu(null);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (conversationId, e) => {
    if (e) e.stopPropagation();
    
    try {
      await axios.delete(`http://localhost:5000/api/conversations/${conversationId}`);
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversation?.id === conversationId) {
        const remaining = conversations.filter(conv => conv.id !== conversationId);
        setActiveConversation(remaining[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const renameConversation = async (conversationId, title) => {
    try {
      await axios.put(`http://localhost:5000/api/conversations/${conversationId}`, {
        title: title
      });
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, title } : conv
      ));
      
      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => ({ ...prev, title }));
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const handleRenameSubmit = (e, conversationId) => {
    e.preventDefault();
    if (newTitle.trim()) {
      renameConversation(conversationId, newTitle.trim());
      setRenamingConversation(null);
      setNewTitle('');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    const userMessageObj = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessageObj]);
    setLoading(true);
    setTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
        conversationId: activeConversation?.id
      });

      setTimeout(() => {
        const botMessageObj = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessageObj]);
        setLoading(false);
        setTyping(false);
        
        if (messages.length === 0 && userMessage) {
          const newTitle = userMessage.length > 25 
            ? userMessage.substring(0, 25) + '...' 
            : userMessage;
          if (activeConversation) {
            renameConversation(activeConversation.id, newTitle);
          }
        }
        
        loadConversations();
      }, 1000);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      setTimeout(() => {
        const errorMessageObj = {
          id: (Date.now() + 1).toString(),
          text: "I'm here to help with programming questions! What would you like to know about Python, JavaScript, Java, or other programming topics?",
          sender: 'bot',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, errorMessageObj]);
        setLoading(false);
        setTyping(false);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleThemeToggle = async () => {
    if (!user) return;
    
    const newTheme = user.preferences.theme === 'dark' ? 'light' : 'dark';
    try {
      await updatePreferences({
        ...user.preferences,
        theme: newTheme
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!user) {
    return <div>Please log in to access the chat.</div>;
  }

  return (
    <div className={`chat-container ${user?.preferences?.theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="chat-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💻</span>
            <span className="logo-text">CodeMentor AI</span>
          </div>
        </div>
        <div className="header-right">
          <div className="theme-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={user?.preferences?.theme === 'dark'}
                onChange={handleThemeToggle}
              />
              <span className="slider"></span>
            </label>
            <span className="theme-icon">
              {user?.preferences?.theme === 'dark' ? '🌙' : '☀️'}
            </span>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className="sidebar">
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={createNewConversation}>
              <span>+</span> New Chat
            </button>
          </div>
          
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <p>No conversations yet</p>
                <span>Start a new chat to begin</span>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveConversation(conversation);
                    setShowConversationMenu(null);
                  }}
                >
                  <div className="conversation-content">
                    {renamingConversation === conversation.id ? (
                      <form onSubmit={(e) => handleRenameSubmit(e, conversation.id)}>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => {
                            setRenamingConversation(null);
                            setNewTitle('');
                          }}
                          autoFocus
                          className="rename-input"
                        />
                      </form>
                    ) : (
                      <h4>{conversation.title}</h4>
                    )}
                    <span>{formatDate(conversation.updatedAt)}</span>
                  </div>
                  <div className="conversation-actions">
                    <button 
                      className="menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConversationMenu(showConversationMenu === conversation.id ? null : conversation.id);
                      }}
                    >
                      ⋮
                    </button>
                    
                    {showConversationMenu === conversation.id && (
                      <div className="conversation-menu">
                        <button onClick={() => {
                          setRenamingConversation(conversation.id);
                          setNewTitle(conversation.title);
                          setShowConversationMenu(null);
                        }}>
                          Rename
                        </button>
                        <button onClick={(e) => deleteConversation(conversation.id, e)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-content">
          <div className="chat-messages">
            {messages.length === 0 && !activeConversation ? (
              <div className="welcome-screen">
                <div className="welcome-content">
                  <h2>Welcome to CodeMentor AI</h2>
                  <p>Your intelligent programming assistant. Ask me anything about coding!</p>
                  <div className="suggestions">
                    <h3>Try asking:</h3>
                    <div className="suggestion-card" onClick={() => handleSuggestionClick("Hello!")}>
                      👋 Say Hello
                    </div>
                    <div className="suggestion-card" onClick={() => handleSuggestionClick("How do I write a function in Python?")}>
                      Python functions
                    </div>
                    <div className="suggestion-card" onClick={() => handleSuggestionClick("Explain JavaScript closures")}>
                      JavaScript closures
                    </div>
                    <div className="suggestion-card" onClick={() => handleSuggestionClick("What is React hooks?")}>
                      React hooks
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-content">
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="message bot">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a programming question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !inputMessage.trim()}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;