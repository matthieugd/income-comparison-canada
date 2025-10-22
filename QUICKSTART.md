# Quick Start Guide ⚡

Get the Income Comparison Canada app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Git installed

## Steps

### 1. Navigate to the Project

```bash
cd income-comparison-canada
```

### 2. Setup Backend (Terminal 1)

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

✅ Backend running at http://localhost:3001

### 3. Setup Frontend (Terminal 2)

Open a **new terminal** window:

```bash
cd income-comparison-canada/frontend
npm install
cp .env.example .env
npm run dev
```

✅ Frontend running at http://localhost:5173

### 4. Open in Browser

Navigate to: **http://localhost:5173**

### 5. Test It!

1. Enter an income: `65000`
2. Click "Show My Position"
3. Watch the animation! 🎉

## That's It!

You're now running the Income Comparison Canada application.

## What Just Happened?

- **Backend**: Express server serving census data via REST API
- **Frontend**: React app with animated visualization
- **Data**: Census 2021 income distribution loaded in memory

## Next Steps

Want to do more? Check out:

- **SETUP.md** - Detailed setup instructions
- **README.md** - Full project documentation
- **CLAUDE.md** - Use with Claude Code
- **CONTRIBUTING.md** - Make changes

## Common Issues

**Backend won't start?**
→ Run `npm install` in the backend directory

**Frontend shows API errors?**
→ Make sure backend is running in Terminal 1

**Port already in use?**
→ Stop other processes or change PORT in .env

## Push to GitHub

Ready to save your work?

```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/yourusername/income-comparison-canada.git
git push -u origin main
```

See **GITHUB_SETUP.md** for details.

---

Built with ❤️ in Canada 🇨🇦
