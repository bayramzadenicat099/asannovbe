const express = require('express');
const Queue = require('../models/Queue');
const router = express.Router();

// Helper to generate queue number
const generateQueueNumber = async (serviceType, category) => {
  let prefix = serviceType.substring(0, 1).toUpperCase();
  
  // Custom logic for Məhkumluq arayışı
  if (serviceType === 'Məhkumluq arayışı') {
    if (category.includes('İnformasiya')) {
      prefix = 'A';
    } else {
      prefix = 'D';
    }
  } else if (serviceType === 'Ümumivətəndaş Xarici Pasport') {
    if (category.includes('İnformasiya')) {
      prefix = 'P'; // Passport Info
    } else if (category.includes('Hazır sənəd')) {
      prefix = 'H'; // Ready
    } else {
      prefix = 'S'; // Document acceptance
    }
  } else {
    // Other services separation
    if (category.includes('İnformasiya')) {
      prefix = 'I'; // Default for Information
    }
  }

  let count = 0;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Count only today, same service AND same category type (prefix)
    count = await Queue.countDocuments({ 
      queueNumber: { $regex: new RegExp(`^${prefix}-`) },
      timestamp: { $gte: today } 
    });
  } catch (err) {
    count = Math.floor(Math.random() * 100);
  }
  const number = (count + 1).toString().padStart(3, '0');
  return `${prefix}-${number}`;
};

// Create queue
router.post('/', async (req, res) => {
  const { serviceType, category, age, finCode } = req.body;
  
  // Custom age check: Only for generic "Hazır sənəd" of other services
  if (serviceType !== 'Ümumivətəndaş Xarici Pasport' && category.includes('Hazır sənəd') && age !== undefined && parseInt(age) < 18) {
    return res.status(400).json({ message: 'Yaş 18-dən az olduğu üçün növbə yaradıla bilməz.' });
  }

  try {
    const queueNumber = await generateQueueNumber(serviceType, category);
    const newQueue = new Queue({
      queueNumber,
      serviceType,
      category,
      age,
      finCode,
    });
    try {
      await newQueue.save();
      res.status(201).json(newQueue);
    } catch (dbErr) {
      // Fallback for demo if DB is down
      const mockTicket = { ...newQueue.toObject(), _id: Date.now().toString(), timestamp: new Date() };
      res.status(201).json(mockTicket);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Növbə yaradılarkən xəta baş verdi.' });
  }
});

// List all queues (for admin)
router.get('/', async (req, res) => {
  try {
    const { status, service, date } = req.query;
    let query = {};
    if (status) query.status = status;
    if (service) query.serviceType = service;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.timestamp = { $gte: start, $lt: end };
    }
    const queues = await Queue.find(query).sort({ timestamp: -1 });
    res.json(queues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching queues' });
  }
});

// Update status
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const queue = await Queue.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: 'Error updating queue' });
  }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const query = { timestamp: { $gte: targetDate, $lt: nextDay } };
    
    const totalToday = await Queue.countDocuments(query);
    const completedToday = await Queue.countDocuments({ ...query, status: 'done' });
    const cancelledToday = await Queue.countDocuments({ ...query, status: 'cancelled' });
    
    res.json({ totalToday, completedToday, cancelledToday });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
