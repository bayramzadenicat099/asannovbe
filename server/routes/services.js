const express = require('express');
const Service = require('../models/Service');
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    // Fallback for demo
    res.json([{ name: 'Məhkumluq arayışı' }, { name: 'Sürücülük vəsiqəsi' }]);
  }
});

// Add a service
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const service = new Service({ name });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error adding service' });
  }
});

// Delete a service
router.delete('/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting service' });
  }
});

module.exports = router;
