import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css';
import asian from './assets/asian.jpg';
import southAsian from './assets/southAsian.jpg';
import white from './assets/white.jpg';
import CheckRace from './CheckRace'; // Import halaman CheckRace.jsx
import Information from './Information'; // Import halaman Information.jsx

// Komponen HomePage untuk halaman utama
function HomePage() {
  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">Discover Racial Diversity Through AI</h1>
              <p className="hero-description">
                Explore our comprehensive dataset of facial features across different races and try our AI-powered race detection tool.
              </p>
              <div className="button-group">
                <Link to="/check-race" className="button primary-button">
                  Try Race Checker
                </Link>
                <Link to="/information" className="button secondary-button">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hero-image">
              {/* Ganti 4x3 grid dengan 1 gambar */}
              <div className="single-face-image">
                <img src="./src/assets/race.png" alt="Facial Recognition" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">About The Dataset</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon database-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8C16.97 8 21 6.88 21 4C21 1.12 16.97 0 12 0C7.03 0 3 1.12 3 4C3 6.88 7.03 8 12 8Z" fill="currentColor"/>
                  <path d="M21 10C21 12.88 16.97 14 12 14C7.03 14 3 12.88 3 10V4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 16C21 18.88 16.97 20 12 20C7.03 20 3 18.88 3 16V10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="feature-title">Comprehensive Collection</h3>
              <p className="feature-description">
                Lebih dari 100,000 gambar wajah yang mewakili latar belakang ras yang beragam
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon chart-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2L12 12L17 17" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="feature-title">Balanced Distribution</h3>
              <p className="feature-description">
                Representasi yang setara di berbagai kategori ras
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon check-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="feature-title">High Accuracy</h3>
              <p className="feature-description">
                Professionally validated and verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Race Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Race Categories</h2>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-image">
                <img src={asian} alt="East Asian" />
              </div>
              <div className="category-content">
                <h3 className="category-title">East Asian</h3>
                <p className="category-description">
                  Including Chinese, Japanese, Korean, and related groups
                </p>
              </div>
            </div>
            <div className="category-card">
              <div className="category-image">
                <img src={southAsian} alt="South Asian" />
              </div>
              <div className="category-content">
                <h3 className="category-title">South Asian</h3>
                <p className="category-description">
                  Including Indian, Pakistani, Bangladeshi, and related groups
                </p>
              </div>
            </div>
            <div className="category-card">
              <div className="category-image">
                <img src={white} alt="White" />
              </div>
              <div className="category-content">
                <h3 className="category-title">White</h3>
                <p className="category-description">  
                  Including European, American, and related groups
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main App component dengan Router
function App() {
  return (
    <Router>
      {/* Navigation */}
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563EB" />
              <path d="M2 17L12 22L22 17" stroke="#2563EB" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="#2563EB" strokeWidth="2" />
            </svg>
            <span>RaceAI</span>
          </div>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/check-race" className="nav-link">Check Your Race</Link>
            <Link to="/information" className="nav-link">Information</Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/check-race" element={<CheckRace />} />
        <Route path="/information" element={<Information />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3B82F6" />
                  <path d="M2 17L12 22L22 17" stroke="#3B82F6" strokeWidth="2" />
                  <path d="M2 12L12 17L22 12" stroke="#3B82F6" strokeWidth="2" />
                </svg>
                <span>RaceAI</span>
              </div>
              <p className="footer-text">
                Exploring racial diversity through artificial intelligence
              </p>
            </div>
            <div className="footer-column">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/information">Information</Link></li>
                <li><Link to="/check-race">Race Checker</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-title">Resources</h3>
              <ul className="footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-title">Connect</h3>
              <div className="social-links">
                <a href="#" className="social-icon twitter-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 4.01C21.1 4.5 20.1 4.8 19 4.95C18.1 4 16.8 3.5 15.5 3.5C13 3.5 10.9 5.6 10.9 8.17C10.9 8.55 10.9 8.93 11 9.3C7 9.08 3.7 7.18 1.5 4.3C1.1 5 0.9 5.7 0.9 6.5C0.9 8 1.7 9.35 3 10.1C2.2 10.1 1.5 9.88 0.9 9.48V9.58C0.9 11.8 2.5 13.63 4.7 14.08C4.3 14.18 3.9 14.23 3.5 14.23C3.2 14.23 2.9 14.18 2.6 14.13C3.2 15.95 4.8 17.3 6.9 17.35C5.4 18.55 3.4 19.3 1.3 19.3C0.9 19.3 0.5 19.28 0.1 19.23C2.2 20.55 4.7 21.3 7.3 21.3C15.5 21.3 20 14.35 20 8.47C20 8.27 20 8.07 20 7.87C20.9 7.2 21.7 6.35 22.3 5.35L22 4.01Z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" className="social-icon github-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1.27C5.99 1.27 1.11 6.15 1.11 12.16C1.11 17.08 4.1 21.18 8.32 22.62C8.86 22.72 9.05 22.39 9.05 22.1C9.05 21.84 9.04 21.06 9.04 20.19C6.13 20.8 5.48 18.84 5.48 18.84C5 17.65 4.3 17.31 4.3 17.31C3.28 16.65 4.37 16.65 4.37 16.65C5.5 16.72 6.06 17.76 6.06 17.76C7.06 19.37 8.53 18.89 9.08 18.6C9.17 17.9 9.45 17.41 9.76 17.16C7.43 16.9 4.96 15.97 4.96 11.76C4.96 10.53 5.37 9.5 6.08 8.7C5.97 8.41 5.61 7.3 6.19 5.85C6.19 5.85 7.13 5.56 9.03 6.82C9.94 6.58 10.91 6.45 11.87 6.45C12.84 6.45 13.81 6.58 14.72 6.82C16.62 5.56 17.56 5.85 17.56 5.85C18.14 7.3 17.78 8.41 17.67 8.7C18.39 9.5 18.79 10.53 18.79 11.76C18.79 15.98 16.32 16.9 13.97 17.15C14.36 17.47 14.71 18.1 14.71 19.07C14.71 20.45 14.7 21.73 14.7 22.1C14.7 22.39 14.89 22.73 15.43 22.62C19.65 21.18 22.64 17.08 22.64 12.16C22.64 6.15 17.76 1.27 12 1.27Z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" className="social-icon linkedin-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H6.5V10H9V17ZM7.7 8.7C6.8 8.7 6 7.9 6 7C6 6.1 6.8 5.3 7.7 5.3C8.6 5.3 9.4 6.1 9.4 7C9.4 7.9 8.6 8.7 7.7 8.7ZM18 17H15.5V13.5C15.5 12.7 14.8 12 14 12C13.2 12 12.5 12.7 12.5 13.5V17H10V10H12.5V11.3C12.9 10.5 13.9 10 15 10C16.7 10 18 11.3 18 13V17Z" fill="currentColor"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="copyright">
            © 2025 RaceAI. All rights reserved.
          </div>
        </div>
      </footer>
    </Router>
  );
}

export default App;