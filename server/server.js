require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');
const serviceRoutes = require('./routes/services');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Storage for demo (if MongoDB is not available)
let mockQueues = [];
let mockServices = [{ _id: '1', name: 'Məhkumluq arayışı' }];
let mockAdmins = [];

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/services', serviceRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asan-queue', {
  serverSelectionTimeoutMS: 2000,
})
.then(async () => {
  console.log('Connected to MongoDB');
  // Seed default service if empty
  const Service = require('./models/Service');
  const count = await Service.countDocuments();
  if (count === 0) {
    await Service.insertMany([
      { name: 'Məhkumluq arayışı' },
      { name: 'Ümumivətəndaş Xarici Pasport' }
    ]);
    console.log('Default services seeded');
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.warn('MongoDB connection failed. Switching to MOCK MODE for demo.');
  console.log(`Server running on port ${PORT} (MOCK MODE)`);
  app.listen(PORT);
});
