# Frontend - Amazon Price Tracker

React application with Clerk authentication for Amazon price tracking.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your Clerk publishable key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
```

## Features

- **Authentication**: Email verification via Clerk
- **Dashboard**: View statistics and quick actions
- **Product Management**: Add, edit, delete products
- **Real-time Updates**: Toast notifications
- **Responsive Design**: Works on all devices

## Pages

- `/` - Landing page (Dashboard if authenticated)
- `/products` - Product list and management
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Manual
```bash
npm run build
# Upload dist/ folder to hosting
```
