# Amazon Price Tracker Bot 🤖
<img width="1918" height="953" alt="image" src="https://github.com/user-attachments/assets/ed9f3eb5-eddf-4e05-bdeb-5af939032f6e" />
An automated Python bot that monitors Amazon product prices and sends email alerts when prices drop below your target.

## Features ✨

- 📦 Track multiple products simultaneously
- ⏰ Automatic price checking every 24 hours
- 📧 Email notifications when deals are found
- 💰 Support for multiple currencies (USD, INR, etc.)
- 🔄 Runs continuously in the background

## Setup Instructions 🚀

### 1. Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (Cloud) or local MongoDB installation
- Gmail account with App Password for email notifications

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials:
# - CLERK_SECRET_KEY (from Clerk.com)
# - MONGODB_URI (from MongoDB Atlas)
# - SMTP credentials (Gmail App Password)
# - FRONTEND_URL

# Initialize database
npm run init-db

# Development mode (auto-reload on file changes)
npm run dev

# Production mode
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Development mode (Vite dev server on http://localhost:3000)
npm run dev

# Production build
npm run build
```

### 4. Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/amazon-tracker
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

**Frontend Setup**
- Create account via Clerk authentication on the app
- Add Amazon product URLs through the dashboard UI

### 5. Adding Products to Track

1. Log in to the web dashboard
2. Click "Add Product"
3. Enter Amazon product URL and target price (in INR)
4. System automatically scrapes current price and title
5. Price checks run daily at 10:00 AM
6. Email alerts sent when deals are found

### 6. Running the Application

**In separate terminals:**

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Frontend UI
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## How It Works 🔧

1. **Scraping**: Uses BeautifulSoup to extract product prices from Amazon
2. **Comparison**: Compares current prices with your target prices
3. **Notification**: Sends email alerts when deals are found
4. **Scheduling**: Uses the `schedule` library to run every 24 hours
5. **Continuous**: Runs in the background until stopped (Ctrl+C)

## Customization Options ⚙️

### Change Check Frequency

Edit the schedule line in `main.py`:

```python
# Check every 12 hours
schedule.every(12).hours.do(check_prices)

# Check every day at 9 AM
schedule.every().day.at("09:00").do(check_prices)
```

### Add More Products

Simply add more dictionaries to the `PRODUCTS` list with:
- `name`: Product description
- `url`: Amazon product URL
- `target_price`: Your desired price threshold

## Troubleshooting 🔍

### Price Not Found
- Amazon's HTML structure may change
- Try accessing the URL in a browser first
- Check if you need to update the scraping selectors

### Email Not Sending
- Verify your email credentials in `.env`
- For Gmail, use an App Password, not your regular password
- Check if 2-factor authentication is enabled

### Bot Stops Running
- Ensure your computer doesn't go to sleep
- Consider running on a server or cloud instance for 24/7 operation

## Running 24/7 ⚡

### Windows
Use Task Scheduler or run in background:
```bash
pythonw main.py
```

### Linux/Mac
Use `nohup` or create a systemd service:
```bash
nohup python3 main.py &
```

## Dependencies 📚

- `beautifulsoup4` - HTML parsing
- `requests` - HTTP requests
- `python-dotenv` - Environment variables
- `schedule` - Task scheduling

## License 📄

Free to use and modify for personal projects.
