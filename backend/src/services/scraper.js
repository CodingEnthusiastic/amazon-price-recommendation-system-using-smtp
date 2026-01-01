const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Amazon product price using Cheerio (lightweight alternative to Puppeteer)
 * @param {string} url - Amazon product URL
 * @returns {Promise<{price: number, title: string}>}
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

    // Extract numeric price - handle different formats
    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    if (!priceMatch) {
      throw new Error('Could not parse price from text: ' + priceText);
    }

    const price = parseFloat(priceMatch[0].replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid price value: ' + price);
    }

    // Extract title
    let title = $('#productTitle').text().trim();
    if (!title) {
      title = $('h1.a-size-large').text().trim();
    }
    if (!title) {
      title = $('span#productTitle').text().trim();
    }
    if (!title) {
      title = 'Unknown Product';
    }

    console.log(`✅ Successfully scraped - Price: ${price}, Title: ${title.substring(0, 50)}...`);

    return {
      price,
      title,
      currency: priceText.includes('₹') ? 'INR' : priceText.includes('$') ? 'USD' : 'UNKNOWN'
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
  delay
};
