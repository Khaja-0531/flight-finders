import express from 'express';
import Flight from '../models/Flight.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Search flights
router.get('/search', async (req, res) => {
  try {
    const { 
      departureCity, 
      destinationCity, 
      departureDate, 
      returnDate 
    } = req.query;

    let query = {};
    
    if (departureCity) {
      query.departureCity = new RegExp(departureCity, 'i');
    }
    
    if (destinationCity) {
      query.destinationCity = new RegExp(destinationCity, 'i');
    }
    
    if (departureDate) {
      const startDate = new Date(departureDate);
      const endDate = new Date(departureDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.departureTime = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Only show flights with available seats and scheduled status
    query.availableSeats = { $gt: 0 };
    query.status = 'scheduled';

    const flights = await Flight.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ departureTime: 1 });

    res.json({ flights });
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({ message: 'Error searching flights' });
  }
});

// Get all flights (admin/operator only)
router.get('/', authenticate, authorize(['admin', 'flight_operator']), async (req, res) => {
  try {
    const flights = await Flight.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ departureTime: 1 });

    res.json({ flights });
  } catch (error) {
    console.error('Get flights error:', error);
    res.status(500).json({ message: 'Error fetching flights' });
  }
});

// Get single flight
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({ flight });
  } catch (error) {
    console.error('Get flight error:', error);
    res.status(500).json({ message: 'Error fetching flight' });
  }
});

// Add new flight (admin/operator only)
router.post('/', authenticate, authorize(['admin', 'flight_operator']), async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      departureCity,
      destinationCity,
      departureTime,
      arrivalTime,
      duration,
      price,
      totalSeats,
      aircraft,
      gate
    } = req.body;

    // Check if flight number already exists
    const existingFlight = await Flight.findOne({ flightNumber });
    if (existingFlight) {
      return res.status(400).json({ message: 'Flight number already exists' });
    }

    const flight = new Flight({
      flightNumber,
      airline,
      departureCity,
      destinationCity,
      departureTime,
      arrivalTime,
      duration,
      price,
      totalSeats,
      availableSeats: totalSeats,
      aircraft,
      gate,
      createdBy: req.user._id
    });

    await flight.save();
    await flight.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: 'Flight added successfully',
      flight
    });
  } catch (error) {
    console.error('Add flight error:', error);
    res.status(500).json({ message: 'Error adding flight' });
  }
});

// Update flight (admin/operator only)
router.put('/:id', authenticate, authorize(['admin', 'flight_operator']), async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Update flight details
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        flight[key] = req.body[key];
      }
    });

    await flight.save();
    await flight.populate('createdBy', 'firstName lastName');

    res.json({
      message: 'Flight updated successfully',
      flight
    });
  } catch (error) {
    console.error('Update flight error:', error);
    res.status(500).json({ message: 'Error updating flight' });
  }
});

// Delete flight (admin only)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    await Flight.findByIdAndDelete(req.params.id);

    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    console.error('Delete flight error:', error);
    res.status(500).json({ message: 'Error deleting flight' });
  }
});

export default router;