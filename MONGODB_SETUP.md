# MongoDB Setup Instructions

## Update Your MongoDB Connection String

Replace `<db_password>` in your `.env` file with your actual MongoDB password:

```env
MONGODB_URI=mongodb+srv://rishabh10d58_db_user:YOUR_ACTUAL_PASSWORD@cluster0.gintdm1.mongodb.net/amazon-price-tracker?retryWrites=true&w=majority
```

## Render Environment Variables

Add this environment variable in your Render dashboard:

1. Go to your backend service → **Environment**
2. Add variable:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://rishabh10d58_db_user:YOUR_PASSWORD@cluster0.gintdm1.mongodb.net/amazon-price-tracker?retryWrites=true&w=majority`

## MongoDB Atlas Settings

Make sure your MongoDB Atlas cluster allows connections from Render:

1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

## What Changed

✅ **Removed SQLite** - No more local database files  
✅ **Added MongoDB** - Cloud database that persists across deployments  
✅ **Added Mongoose** - MongoDB ODM for Node.js  
✅ **Updated all controllers** - Now use MongoDB queries  
✅ **Updated scheduler** - Works with MongoDB  
✅ **No disk needed on Render** - Database is in the cloud  

## Database Collections

- **users** - User accounts synced from Clerk
- **products** - Tracked Amazon products
- **pricehistories** - Historical price data
- **notifications** - Email notification records

## Testing Locally

1. Update `backend/.env` with your MongoDB password
2. Run `cd backend && npm install` to install mongoose
3. Run `npm run dev` to start server
4. Server will automatically connect to MongoDB

## Migration Notes

- All your previous data is in the local SQLite database
- The new MongoDB database starts empty
- Users will be synced automatically when they log in
- They'll need to re-add their products
