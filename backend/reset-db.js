// Quick fix: Delete database and restart fresh
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  // console.log('✅ Database deleted successfully');
  // console.log('📝 The database will be recreated when you restart the server');
  // console.log('');
  // console.log('Next steps:');
  // console.log('1. Restart backend server: npm start');
  // console.log('2. Refresh browser (Ctrl + F5)');
  // console.log('3. Sign in again');
  // console.log('4. Try adding product');
} else {
  // console.log('❌ Database file not found');
}
