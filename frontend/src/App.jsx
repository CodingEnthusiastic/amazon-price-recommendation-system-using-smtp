import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp, useAuth, useUser } from '@clerk/clerk-react';
import { setAuthToken, syncUser } from './services/api';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Landing from './pages/Landing';
import './App.css';

function App() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      if (isLoaded) {
        if (isSignedIn) {
          try {
            console.log('🔑 Fetching authentication token...');
            // Get token and set it
            const token = await getToken();
            
            if (!token) {
              console.error('❌ No token received from Clerk');
              setAuthReady(true);
              return;
            }
            
            console.log('✅ Token received, setting in API client...');
            setAuthToken(token);
            
            // Small delay to ensure token is set
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Sync user to backend database
            console.log('🔄 Syncing user to database...');
            await syncUser();
            console.log('✅ User synced successfully');
            
            setAuthReady(true);
          } catch (error) {
            console.error('❌ Auth setup error:', error.message);
            setAuthReady(true); // Allow navigation even if sync fails
          }
        } else {
          console.log('🚪 Not signed in');
          setAuthToken(null);
          setAuthReady(true);
        }
      }
    };

    // Reset auth ready when sign-in state changes
    setAuthReady(false);
    setupAuth();
  }, [isSignedIn, isLoaded, getToken]);

  // Show loading while Clerk is initializing OR while setting up auth
  if (!isLoaded || (isSignedIn && !authReady)) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={isSignedIn ? <Dashboard /> : <Landing />} />
        <Route path="/products" element={<ProductList />} />
        <Route
          path="/sign-in/*"
          element={
            <div className="auth-container">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="auth-container">
              <SignUp routing="path" path="/sign-up" />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
