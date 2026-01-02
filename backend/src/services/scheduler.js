const cron = require('node-cron');
const User = require('../models/User');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const { scrapeAmazonPrice, delay } = require('./scraper');
const { sendPriceAlert } = require('./emailService');

/**
 * Check all active products and send alerts if price is below target
 */
async function checkAllPrices() {
  console.log('\n' + '='.repeat(60));
  console.log(`🤖 Starting scheduled price check at ${new Date().toLocaleString()}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Get all active products with user email
    const products = await Product.find({ is_active: true }).lean();

    console.log(`📦 Found ${products.length} products to check\n`);

    // Get user emails
    const userEmails = {};
    for (const product of products) {
      if (!userEmails[product.user_id]) {
        const user = await User.findOne({ clerk_id: product.user_id });
        if (user) {
          userEmails[product.user_id] = user.email;
        }
      }
    }

    // Group products by user
    const productsByUser = {};
    products.forEach(product => {
      const email = userEmails[product.user_id];
      if (email) {
        if (!productsByUser[email]) {
          productsByUser[email] = [];
        }
        productsByUser[email].push(product);
      }
    });

    // Check each product
    for (const product of products) {
      console.log(`Checking: ${product.product_name || product.url}`);
      
      try {
        const { price, title } = await scrapeAmazonPrice(product.url);
        
        // Update product - price is now in INR from scraper
        await Product.updateOne(
          { _id: product._id },
          {
            current_price: price,
            product_name: title,
            currency: 'INR',
            last_checked: new Date()
          }
        );

        // Add to price history
        await PriceHistory.create({
          product_id: product._id,
          price
        });

        console.log(`✅ ${title.substring(0, 40)}... - ₹${price}`);

        // Check if price alert needed
        if (price < product.target_price) {
          console.log(`🎉 DEAL FOUND! Price (₹${price}) is below target (₹${product.target_price})`);
        }

        // Add delay to avoid rate limiting
        await delay(2000);
      } catch (error) {
        console.error(`❌ Error checking product:`, error.message);
      }
    }

    // Send email alerts for deals
    console.log('\n📧 Sending email alerts...\n');
    
    for (const [userEmail, userProducts] of Object.entries(productsByUser)) {
      const deals = userProducts.filter(p => p.current_price && p.current_price < p.target_price);
      
      if (deals.length > 0) {
        try {
          await sendPriceAlert(userEmail, deals);
          console.log(`✅ Alert sent to ${userEmail} for ${deals.length} deal(s)`);
        } catch (emailError) {
          console.error(`❌ Failed to send email to ${userEmail}:`, emailError.message);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Price check completed at ${new Date().toLocaleString()}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error in scheduled price check:', error);
  }
}

/**
 * Initialize the scheduler
 */
function initScheduler() {
  // Schedule for 7:15 PM IST every day (IST is UTC+5:30)
  // Cron runs in UTC, so 7:15 PM IST = 1:45 PM UTC
  // But cron.schedule runs in server timezone, so we use '15 19 * * *' for 7:15 PM
  const cronExpression = '15 19 * * *'; // 7:15 PM every day

  cron.schedule(cronExpression, async () => {
    await checkAllPrices();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // IST timezone
  });

  console.log('⏰ Scheduler initialized - Daily price checks at 7:15 PM IST');
  console.log('   Next run:', getNextRunTime());
}

/**
 * Get next scheduled run time
 */
function getNextRunTime() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(19, 15, 0, 0);
  
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

module.exports = {
  initScheduler,
  checkAllPrices
};
