const axios = require('axios');
const cheerio = require('cheerio');

// Current USD to INR conversion rate (can be updated)
const USD_TO_INR_RATE = 83.15;

/**
 * Scrape Amazon product price using Cheerio (lightweight alternative to Puppeteer)
 * @param {string} url - Amazon product URL
 * @returns {Promise<{price: number, title: string, currency: string}>}
 */
async function scrapeAmazonPrice(url) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://www.amazon.com/',
    };

    console.log('🔍 Scraping URL:', url);

    const response = await axios.get(url, { 
      headers,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Accept 4xx responses
    });

    if (response.status === 503) {
      throw new Error('Amazon is blocking requests. Please try again in a few minutes.');
    }

    const $ = cheerio.load(response.data);

    // Try multiple selectors for price (Amazon's HTML varies)
    let priceText = null;
    let selectors = [
      '.a-offscreen',
      '.a-price.apexPriceToPay .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price .a-offscreen',
      'span.a-price-whole',
      '#corePrice_feature_div .a-offscreen',
      '.priceToPay .a-offscreen'
    ];

    for (let selector of selectors) {
      priceText = $(selector).first().text().trim();
      if (priceText) {
        console.log(`✅ Found price with selector: ${selector}`);
        break;
      }
    }

    if (!priceText) {
      console.log('❌ Available price elements:', 
        $('.a-price').length, 
        'price elements,',
        $('.a-offscreen').length,
        'offscreen elements'
      );
      throw new Error('Price element not found. Amazon may be blocking or product unavailable.');
    }

    // Detect currency
    const detectedCurrency = priceText.includes('₹') ? 'INR' : priceText.includes('$') ? 'USD' : 'UNKNOWN';

    // Extract numeric price - handle different formats
    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    if (!priceMatch) {
      throw new Error('Could not parse price from text: ' + priceText);
    }

    let price = parseFloat(priceMatch[0].replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid price value: ' + price);
    }

    // Convert USD to INR if needed
    if (detectedCurrency === 'USD') {
      price = Math.round(price * USD_TO_INR_RATE * 100) / 100; // Round to 2 decimal places
      console.log(`💱 Converted USD price to INR: ${price}`);
    }

    // Extract title with multiple fallbacks
    let title = null;
    const titleSelectors = [
      '#productTitle',
      'h1#title',
      'span#productTitle',
      'h1.a-size-large',
      'h1 span#productTitle',
      '#title_feature_div h1',
      'div#titleSection h1'
    ];

    for (let selector of titleSelectors) {
      title = $(selector).first().text().trim();
      if (title && title.length > 5) {
        console.log(`✅ Found title with selector: ${selector}`);
        break;
      }
    }

    if (!title || title.length < 5) {
      // Try to extract from meta tags as last resort
      title = $('meta[name="title"]').attr('content') || 
              $('meta[property="og:title"]').attr('content') ||
              'Unknown Product';
    }

    console.log(`✅ Successfully scraped - Price: ₹${price} (converted to INR), Title: ${title.substring(0, 50)}...`);

    return {
      price,
      title,
      currency: 'INR' // Always return INR since we convert USD to INR
    };

  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    throw new Error(`Failed to scrape Amazon: ${error.message}`);
  }
}

/**
 * Add delay to avoid rate limiting
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  scrapeAmazonPrice,
  delay,
  USD_TO_INR_RATE
};
