const cron = require('node-cron');
const { db } = require('../models/database');
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
    // Get all active products
    const products = db.prepare(`
      SELECT p.*, u.email 
      FROM products p
      JOIN users u ON p.user_id = u.clerk_id
      WHERE p.is_active = 1
    `).all();

    console.log(`📦 Found ${products.length} products to check\n`);

    // Group products by user
    const productsByUser = {};
    products.forEach(product => {
      if (!productsByUser[product.email]) {
        productsByUser[product.email] = [];
      }
      productsByUser[product.email].push(product);
    });

    // Check each product
    for (const product of products) {
      console.log(`Checking: ${product.product_name || product.url}`);
      
      try {
        const { price, title } = await scrapeAmazonPrice(product.url);
        
        // Update current price
        db.prepare(`
          UPDATE products 
          SET current_price = ?, 
              product_name = ?,
              last_checked = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(price, title, product.id);

        // Add to price history
        db.prepare(`
          INSERT INTO price_history (product_id, price)
          VALUES (?, ?)
        `).run(product.id, price);

        console.log(`  Current: ₹${price} | Target: ₹${product.target_price}`);

        // Check if deal found
        if (price < product.target_price) {
          console.log(`  ✅ DEAL FOUND!`);
          product.current_price = price;
          product.product_name = title;
        } else {
          console.log(`  ⏳ No deal (₹${(price - product.target_price).toFixed(2)} above target)`);
        }

        // Delay to avoid rate limiting
        await delay(2000);

      } catch (error) {
        console.error(`  ❌ Error checking product: ${error.message}`);
      }
    }

    // Send emails for deals found
    console.log('\n📧 Sending email notifications...\n');
    
    for (const [email, userProducts] of Object.entries(productsByUser)) {
      const deals = userProducts.filter(p => 
        p.current_price && p.current_price < p.target_price
      );

      if (deals.length > 0) {
        try {
          await sendPriceAlert(email, deals);
          console.log(`✅ Sent ${deals.length} deal(s) to ${email}`);
          
          // Record notifications
          deals.forEach(deal => {
            db.prepare(`
              INSERT INTO notifications (user_id, product_id, message, is_sent, sent_at)
              VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
            `).run(
              deal.user_id,
              deal.id,
              `Price dropped to ₹${deal.current_price}`
            );
          });
        } catch (error) {
          console.error(`❌ Failed to send email to ${email}: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Price check completed');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Price check failed:', error);
  }
}

/**
 * Initialize cron job to run daily at 7:15 PM
 */
function initScheduler() {
  // Run every day at 7:15 PM (19:15)
  cron.schedule('25 19 * * *', () => {
    checkAllPrices();
  }, {
    timezone: "Asia/Kolkata" // Adjust to your timezone
  });

  console.log('⏰ Scheduler initialized - Will run daily at 7:15 PM IST');
  
  // Optional: Run immediately on startup for testing
  // checkAllPrices();
}

module.exports = {
  initScheduler,
  checkAllPrices
};
