const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
// Make io accessible to routes
app.set('io', io);
app.get('/', (req, res) => {
  res.send('✅ Portfolio Management Backend is running!');
});
// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/investors', require('./routes/investorRoutes'));
app.use('/portfolios', require('./routes/portfolioRoutes'));
app.use('/assets', require('./routes/assetRoutes'));
app.use('/investments', require('./routes/investmentRoutes'));
app.use('/transactions', require('./routes/transactionRoutes'));
app.use('/market-data', require('./routes/marketRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
// WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});
// Simulate live market updates every 5s
const marketInterval = setInterval(() => {
  io.emit('market_update', {
    timestamp: new Date().toISOString(),
    data: {
      NIFTY: +(Math.random() * 200 + 22000).toFixed(2),
      SENSEX: +(Math.random() * 500 + 73000).toFixed(2),
      GOLD: +(Math.random() * 100 + 72000).toFixed(2),
    },
  });
}, 5000);
marketInterval.unref();
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = { app, server };