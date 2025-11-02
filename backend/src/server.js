import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import incomeRoutes from './routes/incomeRoutes.js';
import { loadAllData } from './services/dataService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Load census data into memory on startup
console.log('Loading census data into memory...');
loadAllData();
console.log('Census data loaded successfully!');

// Routes
app.use('/api/income', incomeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Income Comparison API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Income Comparison Canada API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      percentile: '/api/income/percentile?income={amount}&geography={code}&demographic={filter}',
      distribution: '/api/income/distribution?geography={code}&demographic={filter}',
      geographies: '/api/income/geographies',
      demographics: '/api/income/demographics'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      '/api/health',
      '/api/income/percentile',
      '/api/income/distribution',
      '/api/income/geographies',
      '/api/income/demographics'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
