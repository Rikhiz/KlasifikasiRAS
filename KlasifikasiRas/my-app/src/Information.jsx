import React from 'react';
import { Link } from 'react-router-dom';
import './Information.css';

function Information() {
  return (
    <div className="information-page">
      {/* Hero Section */}
      <section className="info-hero-section">
        <div className="container">
          <h1 className="section-title">About RaceAI</h1>
          <p className="info-subtitle">Understanding our technology and how to use it</p>
        </div>
      </section>

      {/* About the Project */}
      <section className="info-section">
        <div className="container">
          <h2 className="info-heading">Our Mission</h2>
          <div className="info-content">
            <p>
              RaceAI is an educational platform that explores facial diversity across different racial backgrounds using 
              artificial intelligence. Our mission is to provide researchers, students, and AI enthusiasts with tools 
              to better understand facial characteristics across populations while promoting diversity awareness.
            </p>
            <p>
              We've developed a comprehensive dataset containing facial images from diverse racial backgrounds, 
              which powers our AI-driven race detection tool. This technology demonstrates how machine learning 
              can identify patterns in facial structures and features associated with different ethnic groups.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="info-section info-section-alt">
        <div className="container">
          <h2 className="info-heading">How to Use RaceAI</h2>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-number">1</div>
              <h3 className="info-card-title">Visit the Race Checker</h3>
              <p className="info-card-description">
                Navigate to the "Check Your Race" page using the navigation menu or the button on the homepage.
              </p>
              <div className="info-card-action">
                <Link to="/check-race" className="button primary-button">Go to Race Checker</Link>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-number">2</div>
              <h3 className="info-card-title">Upload Your Photo</h3>
              <p className="info-card-description">
                Click the upload button to select a clear, front-facing photo. The image should show your face clearly without obstructions.
              </p>
            </div>
            <div className="info-card">
              <div className="info-card-number">3</div>
              <h3 className="info-card-title">Analyze Results</h3>
              <p className="info-card-description">
                Our AI will process your image and display the detected race categories along with confidence percentages.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Information;