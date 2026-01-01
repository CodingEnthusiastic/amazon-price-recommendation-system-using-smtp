const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
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
      email = `user_${userId}@clerk.dev`;
    }

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not retrieve email address from Clerk' 
      });
    }

    console.log('📧 User email:', email);

    // Find or create user
    let user = await User.findOne({ clerk_id: userId });

    if (!user) {
      user = await User.create({
        email,
        clerk_id: userId
      });
      console.log('✅ New user synced:', email);
    } else {
      // Update email if it changed
      if (user.email !== email) {
        user.email = email;
        await user.save();
        console.log('✅ User email updated to', email);
      } else {
        console.log('✅ Existing user found:', email);
      }
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
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Verify user exists
    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      console.error('❌ User not found for stats:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found. Please refresh and try again.' 
      });
    }

    const stats = {
      totalProducts: await Product.countDocuments({ user_id: userId }),
      activeProducts: await Product.countDocuments({ user_id: userId, is_active: true }),
      dealsFound: await Product.countDocuments({ 
        user_id: userId, 
        $expr: { $lt: ['$current_price', '$target_price'] }
      }),
      totalNotifications: await Notification.countDocuments({ user_id: userId }),
    };

    console.log('📊 Stats fetched for user:', userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ getUserStats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
