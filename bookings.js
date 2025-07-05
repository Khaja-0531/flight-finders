import express from 'express';
import Booking from '../models/Booking.js';
import Flight from '../models/Flight.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { flightId, passengers } = req.body;

    // Find flight and check availability
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (flight.availableSeats < passengers.length) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // Calculate total amount
    const totalAmount = flight.price * passengers.length;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      flight: flightId,
      passengers,
      totalAmount
    });

    await booking.save();

    // Update available seats
    flight.availableSeats -= passengers.length;
    await flight.save();

    // Populate booking details
    await booking.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'flight', select: 'flightNumber airline departureCity destinationCity departureTime arrivalTime' }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Get user bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('flight', 'flightNumber airline departureCity destinationCity departureTime arrivalTime status')
      .sort({ bookingDate: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Cancel booking
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('flight');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    booking.cancellationReason = reason;
    booking.paymentStatus = 'refunded';

    await booking.save();

    // Update available seats
    const flight = await Flight.findById(booking.flight._id);
    if (flight) {
      flight.availableSeats += booking.passengers.length;
      await flight.save();
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Get booking details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'flight' }
    ]);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

export default router;