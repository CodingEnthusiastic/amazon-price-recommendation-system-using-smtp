# 📁 Complete Project Structure

```
amazon_price_smtp/
│
├── 📄 .gitignore                    # Protects .env, node_modules, database
├── 📄 .env                          # Your secrets (NEVER commit!)
│
├── 📚 Documentation
│   ├── README.md                    # Original simple README
│   ├── PROJECT_README.md            # Complete project guide
│   ├── SETUP_GUIDE.md              # Quick setup (5 steps)
│   ├── KNOWLEDGE.md                # Technical deep dive
│   └── PROJECT_SUMMARY.md          # What we built
│
├── 🐍 Python Bot (Original)
│   ├── main.py                     # Standalone bot script
│   └── requirements.txt            # Python dependencies
│
├── 🖥️ BACKEND/ (Express.js API)
│   │
│   ├── 📄 package.json             # Node dependencies
│   ├── 📄 .env.example             # Template for secrets
│   ├── 📄 README.md                # Backend docs
│   │
│   └── src/
│       │
│       ├── 📄 server.js            # ⭐ Main entry point
│       │   ├── Express setup
│       │   ├── CORS config
│       │   ├── Rate limiting
│       │   └── Route registration
│       │
│       ├── 🗂️ models/
│       │   └── database.js         # SQLite schema & init
│       │       ├── users table
│       │       ├── products table
│       │       ├── price_history table
│       │       └── notifications table
│       │
│       ├── 🎯 controllers/
│       │   ├── userController.js   # User sync & stats
│       │   └── productController.js # CRUD operations
│       │       ├── getUserProducts()
│       │       ├── addProduct()
│       │       ├── updateProduct()
│       │       ├── deleteProduct()
│       │       └── getPriceHistory()
│       │
│       ├── 🛣️ routes/
│       │   ├── users.js            # /api/users/*
│       │   └── products.js         # /api/products/*
│       │
│       ├── 🔐 middleware/
│       │   └── auth.js             # Clerk JWT verification
│       │
│       └── ⚙️ services/
│           ├── scraper.js          # 🕷️ Amazon scraper
│           │   ├── HTTP requests
│           │   ├── Cheerio parsing
│           │   ├── Price extraction
│           │   └── Error handling
│           │
│           ├── emailService.js     # 📧 Nodemailer SMTP
│           │   ├── HTML templates
│           │   ├── Deal formatting
│           │   └── Email sending
│           │
│           └── scheduler.js        # ⏰ Cron job
│               ├── Daily 10 AM trigger
│               ├── Batch scraping
│               ├── Price comparison
│               └── Email dispatch
│
├── 💻 FRONTEND/ (React + Vite)
│   │
│   ├── 📄 package.json             # React dependencies
│   ├── 📄 vite.config.js           # Vite settings
│   ├── 📄 index.html               # Entry HTML
│   ├── 📄 .env.example             # Template for Clerk key
│   ├── 📄 README.md                # Frontend docs
│   │
│   ├── public/                     # Static assets
│   │
│   └── src/
│       │
│       ├── 📄 main.jsx             # ⭐ React entry point
│       │   ├── ClerkProvider
│       │   ├── BrowserRouter
│       │   └── ToastContainer
│       │
│       ├── 📄 App.jsx              # Main app component
│       │   ├── Routes
│       │   ├── Auth sync
│       │   └── Token management
│       │
│       ├── 📄 index.css            # Global styles
│       ├── 📄 App.css              # App-specific styles
│       │
│       ├── 🧩 components/
│       │   ├── Header.jsx          # Navigation bar
│       │   │   ├── Logo
│       │   │   ├── Nav links
│       │   │   └── UserButton
│       │   │
│       │   └── Header.css          # Header styles
│       │
│       ├── 📄 pages/
│       │   │
│       │   ├── Landing.jsx         # 🏠 Marketing page
│       │   │   ├── Hero section
│       │   │   ├── Features grid
│       │   │   ├── How it works
│       │   │   └── CTA section
│       │   │
│       │   ├── Landing.css         # Landing styles
│       │   │
│       │   ├── Dashboard.jsx       # 📊 User dashboard
│       │   │   ├── Stats cards
│       │   │   ├── Quick actions
│       │   │   └── Info section
│       │   │
│       │   ├── Dashboard.css       # Dashboard styles
│       │   │
│       │   ├── ProductList.jsx     # 🛒 Product cart
│       │   │   ├── Add form
│       │   │   ├── Product grid
│       │   │   ├── Toggle active
│       │   │   ├── Delete button
│       │   │   └── Deal badges
│       │   │
│       │   └── ProductList.css     # Product styles
│       │
│       └── 🔌 services/
│           └── api.js              # Axios API client
│               ├── setAuthToken()
│               ├── syncUser()
│               ├── getUserStats()
│               ├── getProducts()
│               ├── addProduct()
│               ├── updateProduct()
│               ├── deleteProduct()
│               └── getPriceHistory()
│
└── 🗄️ database.db                  # SQLite database (auto-created)
    ├── users (4 columns)
    ├── products (9 columns)
    ├── price_history (4 columns)
    └── notifications (7 columns)
```

---

## 🔄 Data Flow Diagram

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. User signs up
       ▼
┌──────────────────┐
│  Clerk (Auth)    │ → Sends verification email
└──────┬───────────┘
       │ 2. Returns JWT token
       ▼
┌──────────────────┐
│ React Frontend   │
│ - Stores token   │
│ - Shows UI       │
└──────┬───────────┘
       │ 3. POST /api/products
       │    { url, targetPrice }
       ▼
┌──────────────────┐
│ Express Backend  │
│ - Verifies token │
│ - Validates data │
└──────┬───────────┘
       │ 4. Scrape initial price
       ▼
┌──────────────────┐
│  Amazon.com      │
│ - Returns HTML   │
└──────┬───────────┘
       │ 5. Parse price
       ▼
┌──────────────────┐
│  SQLite DB       │
│ - INSERT product │
└──────────────────┘

⏰ Daily at 10:00 AM
┌──────────────────┐
│  node-cron       │
│ - Triggers job   │
└──────┬───────────┘
       │ 6. SELECT all active products
       ▼
┌──────────────────┐
│  SQLite DB       │
│ - Returns list   │
└──────┬───────────┘
       │ 7. For each product
       ▼
┌──────────────────┐
│  Amazon.com      │ → Scrape price
└──────┬───────────┘
       │ 8. Compare with target
       ▼
┌──────────────────┐
│  Price < Target? │
│  Yes → Send Email│
└──────┬───────────┘
       │ 9. SMTP send
       ▼
┌──────────────────┐
│  Gmail SMTP      │
└──────┬───────────┘
       │ 10. Deliver email
       ▼
┌──────────────────┐
│  User's Inbox    │ 📧
└──────────────────┘
```

---

## 🎯 Key Files by Functionality

### Authentication
- `frontend/src/main.jsx` - ClerkProvider setup
- `backend/src/middleware/auth.js` - JWT verification
- `backend/src/controllers/userController.js` - User sync

### Scraping
- `backend/src/services/scraper.js` - All scraping logic
- Uses: Axios + Cheerio

### Scheduling
- `backend/src/services/scheduler.js` - Cron job (10 AM)
- Uses: node-cron

### Email
- `backend/src/services/emailService.js` - SMTP sender
- Uses: Nodemailer

### Database
- `backend/src/models/database.js` - Schema & queries
- Uses: better-sqlite3

### UI
- `frontend/src/pages/ProductList.jsx` - Product management
- `frontend/src/pages/Dashboard.jsx` - Stats & overview
- `frontend/src/components/Header.jsx` - Navigation

### API
- `backend/src/server.js` - Express setup
- `backend/src/routes/products.js` - Product endpoints
- `frontend/src/services/api.js` - API client

---

## 📊 File Count

- **Total Files**: 40+
- **JavaScript**: 20+ files
- **CSS**: 5 files
- **Python**: 1 file
- **Markdown**: 8 docs
- **Config**: 6 files

---

## 💾 Database Size

- **Initial**: ~12 KB (empty)
- **With 10 products**: ~50 KB
- **With history**: Grows ~1 KB per day per product

---

## 🚀 Startup Command

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Both must run simultaneously!
```

---

**This structure gives you:**
- ✅ Clean separation of concerns
- ✅ Scalable architecture
- ✅ Easy to maintain
- ✅ Professional structure
- ✅ Ready for production
