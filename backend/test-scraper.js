// // Test scraper directly
// const { scrapeAmazonPrice } = require('./src/services/scraper');

// const testUrl = 'https://www.amazon.com/dp/B075CYMYK6';

// console.log('🧪 Testing Amazon scraper...\n');
// console.log('URL:', testUrl);
// console.log('-----------------------------------\n');

// scrapeAmazonPrice(testUrl)
//   .then(result => {
//     console.log('\n✅ SUCCESS!');
//     console.log('-----------------------------------');
//     console.log('Price:', result.price);
//     console.log('Currency:', result.currency);
//     console.log('Title:', result.title);
//     console.log('-----------------------------------');
//   })
//   .catch(error => {
//     console.log('\n❌ FAILED!');
//     console.log('-----------------------------------');
//     console.log('Error:', error.message);
//     console.log('-----------------------------------');
//   });
