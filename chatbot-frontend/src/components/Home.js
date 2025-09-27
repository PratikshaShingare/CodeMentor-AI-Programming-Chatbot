import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="logo">
              <span className="logo-icon">💻</span>
              <span className="logo-text">CodeMentor AI</span>
            </div>
          </div>
          <div className="navbar-actions">
            {user ? (
              <Link to="/chat" className="btn btn-primary">
                Go to Chat
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <h1>Your AI Programming Assistant</h1>
          <p>Get instant help with Python, JavaScript, Java, React, SQL, Git, and more. Learn faster with personalized coding guidance.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/chat" className="btn btn-primary btn-large">
                Continue Chatting
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started Free
              </Link>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="code-snippet">
            <div className="code-line">
              <span className="code-keyword">def</span>
              <span className="code-function"> hello_world</span>
              <span className="code-punctuation">():</span>
            </div>
            <div className="code-line indent-1">
              <span className="code-print">print</span>
              <span className="code-punctuation">(</span>
              <span className="code-string">"Hello, World!"</span>
              <span className="code-punctuation">)</span>
            </div>
            <div className="code-line"></div>
            <div className="code-line">
              <span className="code-comment"># Ask me anything about coding!</span>
            </div>
          </div>
        </div>
      </div>

      <main className="home-main">
        <section className="features-section">
          <h2>Why Choose CodeMentor AI?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Intelligent Chat</h3>
              <p>Get accurate answers to your programming questions with our advanced AI technology</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Multiple Languages</h3>
              <p>Support for Python, JavaScript, Java, React, SQL, Git, HTML/CSS and more</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Chat History</h3>
              <p>Access your complete conversation history organized by sessions and topics</p>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your free account in seconds</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Ask Questions</h3>
              <p>Type your programming questions in natural language</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Solutions</h3>
              <p>Receive detailed, contextual answers instantly</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to enhance your coding skills?</h2>
            <p>Join thousands of developers using CodeMentor AI daily to improve their programming knowledge</p>
            {user ? (
              <Link to="/chat" className="btn btn-primary btn-large">
                Start Chatting
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-large">
                Sign Up Free
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CodeMentor AI</h3>
            <p>Your intelligent programming assistant for learning and growth</p>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#api">API</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 CodeMentor AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;