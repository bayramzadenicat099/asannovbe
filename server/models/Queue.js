const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  queueNumber: { type: String, required: true, unique: true },
  serviceType: { type: String, required: true },
  category: { type: String, required: true }, // "Information Request" or "Ready Document"
  age: { type: Number, required: false },
  finCode: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['waiting', 'done', 'cancelled'], 
    default: 'waiting' 
  },
});

module.exports = mongoose.model('Queue', QueueSchema);
