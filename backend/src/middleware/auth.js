const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Middleware to require authentication
const requireAuth = ClerkExpressRequireAuth({
  onError: (error, req) => {
    // console.error('🔒 Auth failed for:', req.method, req.originalUrl);
    console.error('   Error:', error.message);
    console.error('   Reason:', error.reason || 'Unknown');
    return {
      status: 401,
      message: 'Unauthorized. Please refresh the page and try again.'
    };
  }
});

module.exports = { requireAuth };
