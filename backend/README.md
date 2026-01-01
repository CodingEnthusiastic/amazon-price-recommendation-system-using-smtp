# Backend API - Amazon Price Tracker

Express.js REST API for Amazon price tracking application.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Initialize database:**
   ```bash
   npm run init-db
   ```

4. **Start server:**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
CLERK_SECRET_KEY=sk_test_...
DATABASE_PATH=./database.db
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Health Check
```
GET /health
```

### Users
```
POST /api/users/sync - Sync user with Clerk
GET /api/users/stats - Get user statistics
```

### Products
```
GET /api/products - Get all products
POST /api/products - Add new product
PUT /api/products/:id - Update product
DELETE /api/products/:id - Delete product
GET /api/products/:id/history - Get price history
```

## Manual Testing

```bash
# Check prices manually
node -e "require('./src/services/scheduler').checkAllPrices()"

# Test scraper
node -e "
const { scrapeAmazonPrice } = require('./src/services/scraper');
scrapeAmazonPrice('AMAZON_URL')
  .then(console.log)
  .catch(console.error);
"
```

## Scheduler

- Runs daily at 10:00 AM (configurable)
- Checks all active products
- Sends email alerts for deals
- Logs all activities

## Database

SQLite database with tables:
- `users` - User accounts
- `products` - Tracked products
- `price_history` - Historical prices
- `notifications` - Sent notifications

Location: `./database.db`
