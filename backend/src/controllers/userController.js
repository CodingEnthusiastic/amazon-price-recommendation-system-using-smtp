const { db } = require('../models/database');
const { clerkClient } = require('@clerk/clerk-sdk-node');

/**
 * Get or create user from Clerk
 */
exports.syncUser = async (req, res) => {
  try {
    const { userId } = req.auth;
    
    console.log('🔍 Syncing user - ID:', userId);
    
    // Fetch user details from Clerk to get actual email
    let email;
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      
      // Get primary email address
      const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
      email = primaryEmail?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;
      
      console.log('✅ Fetched email from Clerk:', email);
    } catch (clerkError) {
      console.error('❌ Failed to fetch user from Clerk:', clerkError.message);
      // Fallback - this should rarely happen
      email = `user_${userId}@clerk.dev`;
    }

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not retrieve email address from Clerk' 
      });
    }

    console.log('📧 User email:', email);

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(userId);

    if (!user) {
      // Create new user - id and clerk_id are the same
      try {
        db.prepare(`
          INSERT INTO users (id, email, clerk_id)
          VALUES (?, ?, ?)
        `).run(userId, email, userId);

        user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(userId);
        console.log('✅ New user synced:', email);
      } catch (insertError) {
        console.error('❌ User insert error:', insertError.message);
        // Try to get user again in case of race condition
        user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(userId);
        if (!user) {
          throw insertError;
        }
      }
    } else {
      // Update email if it changed
      if (user.email !== email) {
        db.prepare('UPDATE users SET email = ? WHERE clerk_id = ?').run(email, userId);
        console.log('✅ User email updated from', user.email, 'to', email);
      } else {
        console.log('✅ Existing user found:', email);
      }
      user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(userId);
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ syncUser error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user dashboard stats
 */
exports.getUserStats = (req, res) => {
  try {
    const { userId } = req.auth;

    // Verify user exists
    const user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(userId);
    if (!user) {
      console.error('❌ User not found for stats:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found. Please refresh and try again.' 
      });
    }

    const stats = {
      totalProducts: db.prepare('SELECT COUNT(*) as count FROM products WHERE user_id = ?').get(userId).count,
      activeProducts: db.prepare('SELECT COUNT(*) as count FROM products WHERE user_id = ? AND is_active = 1').get(userId).count,
      dealsFound: db.prepare('SELECT COUNT(*) as count FROM products WHERE user_id = ? AND current_price < target_price').get(userId).count,
      totalNotifications: db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?').get(userId).count,
    };

    console.log('📊 Stats fetched for user:', userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ getUserStats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
