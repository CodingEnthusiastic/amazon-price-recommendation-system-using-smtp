const User = require('../models/User');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const { scrapeAmazonPrice } = require('../services/scraper');

/**
 * Get all products for a user
 */
exports.getUserProducts = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Verify user exists
    const user = await User.findOne({ clerk_id: userId });
    if (!user) {
      console.error('❌ User not found for products:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found. Please refresh and try again.' 
      });
    }

    const products = await Product.find({ user_id: userId }).sort({ created_at: -1 });

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

    // Validate Amazon URL
    const amazonDomains = ['amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.ca', 'amazon.co.jp', 'amazon.it', 'amazon.es', 'amazon.com.au'];
    const isValidAmazonUrl = amazonDomains.some(domain => url.toLowerCase().includes(domain));
    
    if (!isValidAmazonUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid Amazon URL (amazon.com, amazon.in, etc.)' 
      });
    }

    // Verify user exists
    const user = await User.findOne({ clerk_id: userId });
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

    // Create product
    const product = await Product.create({
      user_id: userId,
      url,
      product_name: productName,
      target_price: targetPrice,
      current_price: currentPrice
    });

    console.log('✅ Product added successfully - ID:', product._id);

    res.status(201).json({ 
      success: true, 
      product,
      message: 'Product added successfully' 
    });
  } catch (error) {
    console.error('❌ addProduct error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update product
 */
exports.updateProduct = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;
    const { targetPrice, isActive } = req.body;

    // Verify product belongs to user
    const product = await Product.findOne({ _id: id, user_id: userId });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Update fields
    if (targetPrice !== undefined) {
      product.target_price = targetPrice;
    }
    if (isActive !== undefined) {
      product.is_active = isActive;
    }

    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    // Verify product belongs to user
    const product = await Product.findOne({ _id: id, user_id: userId });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await Product.deleteOne({ _id: id });
    await PriceHistory.deleteMany({ product_id: id });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get price history for a product
 */
exports.getPriceHistory = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    // Verify product belongs to user
    const product = await Product.findOne({ _id: id, user_id: userId });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const history = await PriceHistory.find({ product_id: id })
      .sort({ checked_at: -1 })
      .limit(30);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Manually refresh product data (price and name)
 */
exports.refreshProduct = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    // Verify product belongs to user
    const product = await Product.findOne({ _id: id, user_id: userId });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Scrape current data
    const { price, title } = await scrapeAmazonPrice(product.url);
    
    // Update product
    product.current_price = price;
    product.product_name = title;
    product.last_checked = new Date();
    await product.save();

    // Add to price history
    await PriceHistory.create({
      product_id: id,
      price
    });

    res.json({ 
      success: true, 
      product,
      message: 'Product refreshed successfully' 
    });
  } catch (error) {
    console.error('❌ refreshProduct error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
