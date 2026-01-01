import { Link } from 'react-router-dom';
import { FaBell, FaChartLine, FaShieldAlt, FaClock } from 'react-icons/fa';
import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="container">
          <h1>Never Miss an Amazon Deal Again</h1>
          <p className="subtitle">
            Track prices on your favorite Amazon products and get instant email alerts when they drop below your target price.
          </p>
          <Link to="/sign-up" className="btn btn-primary btn-large">
            Start Tracking for Free
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose Our Tracker?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaBell className="feature-icon" />
              <h3>Instant Alerts</h3>
              <p>Get email notifications the moment prices drop below your target.</p>
            </div>
            <div className="feature-card">
              <FaClock className="feature-icon" />
              <h3>Daily Monitoring</h3>
              <p>Automated daily checks at 7:15 PM ensure you never miss a deal.</p>
            </div>
            <div className="feature-card">
              <FaChartLine className="feature-icon" />
              <h3>Price History</h3>
              <p>Track price trends and make informed buying decisions.</p>
            </div>
            <div className="feature-card">
              <FaShieldAlt className="feature-icon" />
              <h3>Secure & Private</h3>
              <p>Your data is encrypted and never shared with third parties.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your free account in seconds with email verification.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Add Products</h3>
              <p>Paste Amazon product URLs and set your target prices.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Alerts</h3>
              <p>Receive email notifications when prices drop below your targets.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Start Saving?</h2>
          <p>Join thousands of smart shoppers tracking Amazon prices.</p>
          <Link to="/sign-up" className="btn btn-primary btn-large">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;
