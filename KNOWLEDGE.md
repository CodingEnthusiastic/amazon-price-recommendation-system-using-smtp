# KNOWLEDGE.md - Technical Deep Dive

## 🎯 Project Overview

This project is an **Amazon Price Tracking System** that monitors product prices and alerts users when deals are found. It combines web scraping, scheduled automation, full-stack web development, and email notifications.

---

## 📚 Core Technologies & Concepts

### 1. Web Scraping Amazon Prices

#### How We Extract Live Amazon Prices

**Challenge**: Amazon doesn't provide a public API for price data, so we need to scrape their HTML.

**Solution**: We use **BeautifulSoup4** (a Python HTML parsing library) combined with **Requests** to fetch and parse Amazon product pages.

#### Step-by-Step Process:

1. **Send HTTP Request with Headers**
   ```python
   header = {
       "User-Agent": "Mozilla/5.0...",
       "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
   }
   response = requests.get(url, headers=header)
   ```
   
   **Why Headers?** 
   - Amazon blocks requests that look like bots
   - Headers make our request look like a real browser
   - Without proper User-Agent, Amazon returns 503 errors or CAPTCHA pages

2. **Parse HTML with BeautifulSoup**
   ```python
   soup = BeautifulSoup(response.content, "html.parser")
   ```
   
   - Converts raw HTML into a navigable tree structure
   - Allows us to search for specific HTML elements

3. **Find Price Element**
   ```python
   price_element = soup.find(class_="a-offscreen")
   ```
   
   **Key Discovery**: Amazon uses the CSS class `a-offscreen` for the actual price value
   - This element contains the clean price (e.g., "$79.99" or "₹7,189.42")
   - It's hidden from visual display but used for screen readers
   - More reliable than visible price elements which can have complex formatting

4. **Extract & Clean Price Text**
   ```python
   price = price_element.get_text()  # "₹7,189.42"
   price_clean = price.replace("₹", "").replace(",", "")  # "7189.42"
   price_float = float(price_clean)  # 7189.42
   ```
   
   - Remove currency symbols (₹, $, INR, USD)
   - Remove thousand separators (commas)
   - Convert to float for numerical comparison

5. **Extract Product Title**
   ```python
   title_element = soup.find(id="productTitle")
   title = title_element.get_text().strip()
   ```
   
   - Uses HTML ID selector (more reliable than classes)
   - `.strip()` removes extra whitespace

#### Technical Challenges & Solutions:

| Challenge | Solution |
|-----------|----------|
| **Amazon blocks bots** | Use realistic User-Agent headers |
| **HTML structure changes** | Use stable selectors (IDs > classes) |
| **Multiple currencies** | Generic text replacement for all symbols |
| **Price formatting varies** | Remove all non-numeric characters except decimal |
| **Rate limiting** | Add delays between requests (`time.sleep(2)`) |
| **CAPTCHA pages** | Rotate User-Agents, avoid too frequent requests |

---

### 2. SMTP Email Automation

#### How We Send Automated Emails

**SMTP** (Simple Mail Transfer Protocol) is the standard for sending emails across the internet.

#### Architecture:

```
Your Python Script → SMTP Server (Gmail) → Recipient's Email
```

#### Step-by-Step Implementation:

1. **Connect to SMTP Server**
   ```python
   with smtplib.SMTP("smtp.gmail.com", port=587) as connection:
   ```
   
   - Gmail's SMTP server: `smtp.gmail.com`
   - Port 587: Standard port for TLS-encrypted SMTP
   - `with` statement: Automatically closes connection

2. **Start TLS Encryption**
   ```python
   connection.starttls()
   ```
   
   - Upgrades connection to encrypted (secure)
   - Protects email credentials and content
   - Required by modern email providers

3. **Authenticate**
   ```python
   connection.login(email_address, app_password)
   ```
   
   - **Important**: Gmail requires App Passwords (not regular password)
   - App Passwords: 16-character codes from Google Account settings
   - Reason: Two-factor authentication security

4. **Send Email**
   ```python
   connection.sendmail(
       from_addr=sender_email,
       to_addrs=recipient_email,
       msg="Subject:Title\n\nBody text".encode("utf-8")
   )
   ```
   
   - Format: `Subject:` line, then blank line, then body
   - `.encode("utf-8")`: Handle special characters (₹, emojis)

#### Why Gmail App Passwords?

```
Regular Password → Blocked by Google (security risk)
App Password → Allows "less secure" apps safely
```

- Generated at: https://myaccount.google.com/apppasswords
- Unique per application
- Can be revoked without changing main password
- Required when 2FA is enabled

#### Email Formatting Best Practices:

```python
message = f"""Subject: {subject}

{body_text}

Link: {url}
"""
```

- Subject must be on first line with `Subject:` prefix
- Blank line separates subject from body
- UTF-8 encoding for international characters

---

### 3. Scheduled Task Automation

#### How We Run Tasks Every 24 Hours

**Library**: `schedule` (Python task scheduler)

#### Concept:

```python
import schedule
import time

# Define what to do
def check_prices():
    print("Checking prices...")

# Schedule it
schedule.every(24).hours.do(check_prices)

# Keep running
while True:
    schedule.run_pending()  # Run if it's time
    time.sleep(60)          # Check every minute
```

#### How It Works:

1. **Job Registration**
   - `schedule.every(24).hours.do(function)` registers a job
   - Stores next run time internally

2. **Event Loop**
   - `while True` keeps script running forever
   - `schedule.run_pending()` checks if any job should run
   - `time.sleep(60)` prevents CPU overuse (check every 60 seconds)

3. **Execution**
   - When time matches, executes the function
   - Automatically calculates next run time

#### Alternative Scheduling Options:

```python
# Every day at specific time
schedule.every().day.at("10:00").do(job)

# Every X hours
schedule.every(12).hours.do(job)

# Every weekday
schedule.every().monday.at("09:00").do(job)

# Every X minutes
schedule.every(30).minutes.do(job)
```

#### Production Deployment:

For 24/7 operation, use:
- **Linux**: `cron` jobs or `systemd` services
- **Windows**: Task Scheduler
- **Cloud**: AWS Lambda, Google Cloud Functions (serverless)
- **Containers**: Docker with restart policies

---

### 4. Full-Stack Architecture (Web Version)

#### Technology Stack:

**Frontend**: React + Clerk (Authentication)
**Backend**: Node.js + Express + SQLite
**Scheduler**: Node-cron
**Scraper**: Puppeteer (Node.js alternative to Python requests/BeautifulSoup)

#### Architecture Diagram:

```
┌─────────────────┐
│  React Frontend │ (User Interface)
│   + Clerk Auth  │
└────────┬────────┘
         │ HTTP/REST API
         ▼
┌─────────────────┐
│ Express Backend │ (API Server)
│  + Node-cron    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ SQLite │ │ Puppeteer│
│   DB   │ │ Scraper  │
└────────┘ └──────────┘
```

#### Data Flow:

1. **User Registration** (Clerk)
   - User signs up with email
   - Clerk sends verification email
   - Creates user session token

2. **Add Product URL**
   - Frontend sends: `POST /api/products`
   - Body: `{ url, targetPrice, userId }`
   - Backend stores in database

3. **Scheduled Check** (Daily at 10:00 AM)
   - Node-cron triggers job
   - Fetch all products from DB
   - For each product:
     - Scrape Amazon price
     - Compare with target
     - If deal found: send email to user

4. **Email Notification**
   - Backend uses Nodemailer (SMTP)
   - Sends to user's verified email
   - Uses your SMTP credentials

#### Database Schema (SQLite):

```sql
-- Users table (synced with Clerk)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    clerk_id TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    url TEXT NOT NULL,
    product_name TEXT,
    target_price REAL NOT NULL,
    current_price REAL,
    last_checked DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Price history (optional)
CREATE TABLE price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    price REAL NOT NULL,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

### 5. Why Each Technology?

#### Python Version (Original):

| Technology | Why? |
|------------|------|
| **BeautifulSoup** | Best Python HTML parser, simple API |
| **Requests** | Easy HTTP library, handles sessions |
| **smtplib** | Built-in Python SMTP client |
| **schedule** | Simplest task scheduler for Python |
| **python-dotenv** | Secure environment variable management |

#### Web Version (Full-Stack):

| Technology | Why? |
|------------|------|
| **React** | Modern UI, component-based, large ecosystem |
| **Clerk** | Easy authentication, email verification built-in |
| **Express** | Minimal Node.js web framework, flexible |
| **SQLite** | Serverless database, no setup required |
| **Puppeteer** | Headless browser, handles JavaScript-rendered content |
| **Nodemailer** | Node.js SMTP client, easy configuration |
| **node-cron** | Cron-like task scheduler for Node.js |

---

### 6. Security Best Practices

#### Environment Variables:

```bash
# .env file (NEVER commit to Git)
SMTP_ADDRESS=smtp.gmail.com
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=app-password-here
CLERK_SECRET_KEY=clerk_secret_xxx
DATABASE_URL=./database.db
```

**Why?**
- Keeps secrets out of code
- Different values per environment (dev/prod)
- Easy to rotate credentials

#### .gitignore Protection:

```
.env
.env.local
node_modules/
*.db
```

Prevents sensitive files from being pushed to GitHub.

#### Authentication Flow (Clerk):

1. User signs up → Clerk creates account
2. Clerk sends verification email
3. User verifies → Gets JWT token
4. Frontend includes token in API requests
5. Backend validates token with Clerk
6. Only valid users can add/view their products

---

### 7. Scaling Considerations

#### Current Limitations:

- Single-threaded scraping (slow for many products)
- No caching (re-scrapes even if checked recently)
- SQLite (not ideal for high concurrency)
- No queue system (can overwhelm Amazon)

#### How to Scale:

1. **Task Queue**: Use Redis + Bull for job queuing
2. **Caching**: Store prices for 1 hour to reduce requests
3. **Database**: Migrate to PostgreSQL for production
4. **Rate Limiting**: Respect Amazon's robots.txt
5. **Proxy Rotation**: Avoid IP bans for high volume
6. **Microservices**: Separate scraper service from API
7. **Monitoring**: Log failures, track success rates

---

### 8. Legal & Ethical Considerations

#### Web Scraping Ethics:

✅ **Allowed**:
- Personal use with reasonable request rates
- Publicly visible data (prices, titles)
- Respecting robots.txt

❌ **Not Allowed**:
- Commercial reselling of scraped data
- Overwhelming servers (DDoS-like behavior)
- Bypassing authentication to scrape private data

#### Amazon's Terms of Service:

- Amazon's TOS prohibits automated scraping
- Risk: Account bans, IP blocks, legal action
- Mitigation: Use for personal tracking only, low frequency

#### Alternatives:

- **Amazon Product Advertising API**: Official API (requires approval)
- **Keepa API**: Third-party price tracking service
- **CamelCamelCamel**: Existing price tracking website

---

## 🚀 Key Learnings

1. **Web scraping requires mimicking real browsers** (headers, delays)
2. **Email automation needs proper authentication** (App Passwords)
3. **Scheduling can be simple** (schedule library) or robust (cron, cloud functions)
4. **Full-stack apps separate concerns** (frontend, backend, database, scheduler)
5. **Security starts with protecting secrets** (.env, .gitignore)
6. **Authentication should be delegated** (Clerk handles complexity)
7. **Databases evolve** (SQLite → PostgreSQL as you scale)

---

## 📖 Further Reading

- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [SMTP Protocol Explained](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)
- [Clerk Authentication Docs](https://clerk.dev/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Web Scraping Best Practices](https://www.scrapehero.com/web-scraping-best-practices/)
- [Cron Expression Syntax](https://crontab.guru/)

---

**Created**: January 2026  
**Purpose**: Educational documentation for Amazon Price Tracker project
