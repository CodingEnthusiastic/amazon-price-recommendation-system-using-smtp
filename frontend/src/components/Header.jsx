import { Link } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/clerk-react';
import { FaShoppingCart } from 'react-icons/fa';
import './Header.css';

function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <FaShoppingCart className="logo-icon" />
          <span>Amazon Price Tracker</span>
        </Link>
        
        <nav className="nav">
          {isSignedIn ? (
            <>
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/products" className="nav-link">My Products</Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link to="/sign-in" className="nav-link">Sign In</Link>
              <Link to="/sign-up" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
