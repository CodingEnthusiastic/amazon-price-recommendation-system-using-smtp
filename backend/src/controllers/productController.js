const { db } = require('../models/database');
const { scrapeAmazonPrice } = require('../services/scraper');

/**
 * Get all products for a user
 */
exports.getUserProducts = (req, res) => {
  try {
    const { userId } = req.auth;

    // Verify user exists
    const user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(userId);
    if (!user) {
      console.error('❌ User not found for products:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found. Please refresh and try again.' 
      });
    }

    const products = db.prepare(`
      SELECT * FROM products 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);

    console.log('📦 Fetched', products.length, 'products for user:', userId);
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ getUserProducts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add a new product to track
 */
exports.addProduct = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { url, targetPrice } = req.body;

    console.log('📦 Adding product - User ID:', userId, 'URL:', url);

    // Validate inputs
    if (!url || !targetPrice) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL and target price are required' 
      });
    }

    // Validate Amazon URL - Check for valid Amazon domains
    const amazonDomains = ['amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.ca', 'amazon.co.jp', 'amazon.it', 'amazon.es', 'amazon.com.au'];
    const isValidAmazonUrl = amazonDomains.some(domain => url.toLowerCase().includes(domain));
    
    if (!isValidAmazonUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid Amazon URL (amazon.com, amazon.in, etc.)' 
      });
    }

    // Verify user exists in database
    const user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(userId);
    if (!user) {
      console.error('❌ User not found in database:', userId);
      return res.status(400).json({ 
        success: false, 
        error: 'User not found. Please refresh the page and try again.' 
      });
    }

    // Try to scrape initial price and title
    let productName = 'Unknown Product';
    let currentPrice = null;

    try {
      const { price, title } = await scrapeAmazonPrice(url);
      productName = title;
      currentPrice = price;
      console.log('✅ Scraped product:', title.substring(0, 50), '- Price:', price);
    } catch (error) {
      console.warn('⚠️ Could not fetch initial product data:', error.message);
    }

    // Insert product
    try {
      const result = db.prepare(`
        INSERT INTO products (user_id, url, product_name, target_price, current_price)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, url, productName, targetPrice, currentPrice);

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
      
      console.log('✅ Product added successfully - ID:', result.lastInsertRowid);

      res.status(201).json({ 
        success: true, 
        product,
        message: 'Product added successfully' 
      });
    } catch (dbError) {
      console.error('❌ Database insert error:', dbError.message);
      throw dbError;
    }
  } catch (error) {
    console.error('❌ addProduct error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update product target price
 */
exports.updateProduct = (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const { targetPrice, isActive } = req.body;

    // Verify product belongs to user
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Update product
    const updates = [];
    const values = [];

    if (targetPrice !== undefined) {
      updates.push('target_price = ?');
      values.push(targetPrice);
    }

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No updates provided' });
    }

    values.push(id);

    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a product
 */
exports.deleteProduct = (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    // Verify product belongs to user
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get price history for a product
 */
exports.getPriceHistory = (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    // Verify product belongs to user
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const history = db.prepare(`
      SELECT * FROM price_history 
      WHERE product_id = ? 
      ORDER BY checked_at DESC
      LIMIT 30
    `).all(id);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
