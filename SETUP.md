# Setup Instructions

Follow these steps to get the Income Comparison Canada application running on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** version 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

Verify your installations:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
git --version
```

## Initial Setup

### 1. Clone the Repository

If you're starting fresh (first time setup):
```bash
git clone https://github.com/yourusername/income-comparison-canada.git
cd income-comparison-canada
```

If you already have the code locally, just navigate to the directory:
```bash
cd income-comparison-canada
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express (web framework)
- cors (cross-origin support)
- dotenv (environment variables)
- nodemon (development auto-reload)

### 3. Configure Backend Environment

Create the environment file:
```bash
cp .env.example .env
```

The default settings in `.env` should work for local development:
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- React and React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- Recharts (additional charts)

### 5. Configure Frontend Environment

Create the environment file:
```bash
cp .env.example .env
```

Default settings:
```
VITE_API_URL=http://localhost:3001
```

## Running the Application

You'll need two terminal windows open.

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Server is running on http://localhost:3001
📊 Environment: development
🌍 CORS enabled for: http://localhost:5173
Loading census data into memory...
✓ Default Canada data loaded
Census data loaded successfully!
```

The backend API is now running at http://localhost:3001

### Terminal 2: Start Frontend Application

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The application is now running at http://localhost:5173

### 3. Open Your Browser

Navigate to http://localhost:5173 and you should see the Income Comparison Canada application!

## Testing the Application

1. Enter an income value (e.g., 65000)
2. Click "Show My Position"
3. Watch the animated character walk along the distribution curve
4. See your percentile rank and comparison statistics

## Troubleshooting

### Backend won't start

**Error: `Cannot find module`**
- Solution: Run `npm install` in the backend directory

**Error: `Port 3001 already in use`**
- Solution: Stop any other process using port 3001, or change the PORT in backend/.env

### Frontend won't start

**Error: `Cannot find module`**
- Solution: Run `npm install` in the frontend directory

**Error: `Port 5173 already in use`**
- Solution: Vite will automatically try the next available port (5174, 5175, etc.)

### CORS Errors

If you see CORS errors in the browser console:
1. Make sure the backend is running
2. Check that FRONTEND_URL in backend/.env matches your frontend URL
3. Restart the backend server after changing .env

### API Connection Issues

**Error: "Failed to fetch data from API"**
- Make sure the backend server is running (Terminal 1)
- Check that VITE_API_URL in frontend/.env points to http://localhost:3001
- Restart the frontend after changing .env

### No Data Showing

If the visualization appears but shows no data:
1. Check backend console for data loading messages
2. Verify `backend/src/data/census-2021/income-canada.json` exists
3. Check browser console for API errors

## Adding More Data

To add provincial or city data:

1. Create a new JSON file in `backend/src/data/census-2021/`
2. Follow the structure in `income-canada.json`
3. Restart the backend server
4. The new geography will appear in the dropdown

See `data/census-2021/README.md` for detailed data structure information.

## Development Tips

### Auto-reload

Both servers have auto-reload enabled:
- Backend: Changes to .js files automatically restart the server
- Frontend: Changes to .jsx files automatically refresh the browser

### Viewing API Responses

Test API endpoints directly:
```bash
# Get distribution data
curl http://localhost:3001/api/income/distribution

# Calculate percentile
curl "http://localhost:3001/api/income/percentile?income=65000"

# List geographies
curl http://localhost:3001/api/income/geographies
```

### Console Logs

- Backend logs appear in Terminal 1
- Frontend logs appear in the browser console (F12)

## Next Steps

Once you have the application running:

1. Read `CLAUDE.md` for development guidelines
2. Check `CONTRIBUTING.md` if you want to contribute
3. Explore the code structure in README.md
4. Add more geographic regions (provinces, cities)
5. Customize the visualization or add new features

## Production Deployment

For deploying to production:

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Render/Railway/Fly.io)
```bash
cd backend
npm start
# Deploy with Node.js 18+
```

See README.md deployment section for detailed instructions.

## Getting Help

If you encounter issues:
1. Check this setup guide
2. Review the troubleshooting section
3. Check the browser console for errors
4. Check the backend terminal for errors
5. Open an issue on GitHub with details

---

Happy coding! 🇨🇦
