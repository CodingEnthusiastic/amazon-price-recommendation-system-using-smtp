// Fix existing users' email addresses by fetching from Clerk
require('dotenv').config();
const { clerkClient } = require('@clerk/clerk-sdk-node');
const { db } = require('./src/models/database');

async function fixUserEmails() {
  console.log('🔧 Fixing user email addresses...\n');
  
  try {
    // Get all users
    const users = db.prepare('SELECT * FROM users').all();
    console.log(`Found ${users.length} users to check\n`);
    
    for (const user of users) {
      console.log(`Checking user: ${user.clerk_id}`);
      console.log(`  Current email: ${user.email}`);
      
      try {
        // Fetch real email from Clerk
        console.log(`  Fetching from Clerk API...`);
        const clerkUser = await clerkClient.users.getUser(user.clerk_id);
        const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId);
        const realEmail = primaryEmail?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;
        
        if (realEmail) {
          console.log(`  📧 Real email from Clerk: ${realEmail}`);
          
          if (user.email !== realEmail) {
            // Update database
            db.prepare('UPDATE users SET email = ? WHERE clerk_id = ?').run(realEmail, user.clerk_id);
            console.log(`  ✅ Email updated!\n`);
          } else {
            console.log(`  ✅ Email already correct!\n`);
          }
        } else {
          console.log(`  ⚠️ No email found in Clerk\n`);
        }
      } catch (error) {
        console.error(`  ❌ Error fetching Clerk user: ${error.message}\n`);
      }
    }
    
    console.log('✅ Email fix complete!');
    
    // Show updated users
    console.log('\n📋 Updated user list:');
    const updatedUsers = db.prepare('SELECT clerk_id, email FROM users').all();
    updatedUsers.forEach(u => console.log(`  ${u.clerk_id}: ${u.email}`));
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixUserEmails();
