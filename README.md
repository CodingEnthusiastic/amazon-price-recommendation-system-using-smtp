# Amazon Price Tracker Bot 🤖

An automated Python bot that monitors Amazon product prices and sends email alerts when prices drop below your target.

## Features ✨

- 📦 Track multiple products simultaneously
- ⏰ Automatic price checking every 24 hours
- 📧 Email notifications when deals are found
- 💰 Support for multiple currencies (USD, INR, etc.)
- 🔄 Runs continuously in the background

## Setup Instructions 🚀

### 1. Install Dependencies

```bash
python -m pip install -r requirements.txt
```

### 2. Configure Environment Variables

Update the `.env` file with your email settings:

```
SMTP_ADDRESS=smtp.gmail.com
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Gmail users**: You need to generate an [App Password](https://myaccount.google.com/apppasswords) instead of using your regular password.

### 3. Add Products to Track

Edit `main.py` and add products to the `PRODUCTS` list:

```python
PRODUCTS = [
    {
        "name": "Product Name",
        "url": "https://www.amazon.com/dp/PRODUCT_ID",
        "target_price": 5000  # Price in your currency
    },
    {
        "name": "Another Product",
        "url": "https://www.amazon.com/dp/ANOTHER_ID",
        "target_price": 3000
    },
]
```

### 4. Run the Bot

```bash
python main.py
```

The bot will:
1. Check all product prices immediately
2. Send email if any deals are found
3. Wait 24 hours and repeat automatically

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
