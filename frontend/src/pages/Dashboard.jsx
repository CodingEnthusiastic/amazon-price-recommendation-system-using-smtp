import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats } from '../services/api';
import { FaBox, FaCheckCircle, FaTag, FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // console.log('📊 Fetching dashboard stats...');
      const response = await getUserStats();
      setStats(response.data.stats);
      // console.log('✅ Stats loaded');
    } catch (error) {
      // console.error('❌ Failed to load stats:', error.message);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <main className="dashboard">
      <div className="container">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Track your Amazon products and deals</p>

        <div className="stats-grid">
          <div className="stat-card">
            <FaBox className="stat-icon" />
            <div className="stat-content">
              <h3>{stats?.totalProducts || 0}</h3>
              <p>Total Products</p>
            </div>
          </div>

          <div className="stat-card">
            <FaCheckCircle className="stat-icon active" />
            <div className="stat-content">
              <h3>{stats?.activeProducts || 0}</h3>
              <p>Active Trackers</p>
            </div>
          </div>

          <div className="stat-card">
            <FaTag className="stat-icon deal" />
            <div className="stat-content">
              <h3>{stats?.dealsFound || 0}</h3>
              <p>Deals Found</p>
            </div>
          </div>

          <div className="stat-card">
            <FaBell className="stat-icon notify" />
            <div className="stat-content">
              <h3>{stats?.totalNotifications || 0}</h3>
              <p>Notifications Sent</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => navigate('/products')}
            >
              <h3>📦 View All Products</h3>
              <p>Manage your tracked products</p>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/products')}
            >
              <h3>➕ Add New Product</h3>
              <p>Start tracking a new Amazon product</p>
            </button>
          </div>
        </div>

        <div className="info-section">
          <h2>How It Works</h2>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-number">1</span>
              <p>Add Amazon product URLs to your cart</p>
            </div>
            <div className="info-card">
              <span className="info-number">2</span>
              <p>Set your desired target prices</p>
            </div>
            <div className="info-card">
              <span className="info-number">3</span>
              <p>Receive email alerts daily at 7:15 PM when deals are found</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
