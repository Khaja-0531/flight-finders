import React, { useState } from 'react';
import { Plane, Clock, MapPin, DollarSign, Users, Calendar, Building2 } from 'lucide-react';
import axios from 'axios';

interface FlightFormProps {
  onFlightAdded?: () => void;
  flightToEdit?: any;
  onCancel?: () => void;
}

const FlightForm: React.FC<FlightFormProps> = ({ onFlightAdded, flightToEdit, onCancel }) => {
  const [formData, setFormData] = useState({
    flightNumber: flightToEdit?.flightNumber || '',
    airline: flightToEdit?.airline || '',
    departureCity: flightToEdit?.departureCity || '',
    destinationCity: flightToEdit?.destinationCity || '',
    departureTime: flightToEdit?.departureTime ? new Date(flightToEdit.departureTime).toISOString().slice(0, 16) : '',
    arrivalTime: flightToEdit?.arrivalTime ? new Date(flightToEdit.arrivalTime).toISOString().slice(0, 16) : '',
    duration: flightToEdit?.duration || '',
    price: flightToEdit?.price || '',
    totalSeats: flightToEdit?.totalSeats || '',
    aircraft: flightToEdit?.aircraft || '',
    gate: flightToEdit?.gate || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const calculateDuration = () => {
    if (formData.departureTime && formData.arrivalTime) {
      const departure = new Date(formData.departureTime);
      const arrival = new Date(formData.arrivalTime);
      const diffMs = arrival.getTime() - departure.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setFormData(prev => ({ 
        ...prev, 
        duration: `${hours}h ${minutes}m` 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const flightData = {
        ...formData,
        price: parseFloat(formData.price),
        totalSeats: parseInt(formData.totalSeats)
      };

      if (flightToEdit) {
        await axios.put(`http://localhost:5000/api/flights/${flightToEdit._id}`, flightData);
      } else {
        await axios.post('http://localhost:5000/api/flights', flightData);
      }

      if (onFlightAdded) onFlightAdded();
      
      // Reset form if adding new flight
      if (!flightToEdit) {
        setFormData({
          flightNumber: '',
          airline: '',
          departureCity: '',
          destinationCity: '',
          departureTime: '',
          arrivalTime: '',
          duration: '',
          price: '',
          totalSeats: '',
          aircraft: '',
          gate: ''
        });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving flight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Plane className="h-6 w-6 text-blue-600" />
          <span>{flightToEdit ? 'Edit Flight' : 'Add New Flight'}</span>
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="flightNumber"
              placeholder="Flight Number (e.g., AA123)"
              value={formData.flightNumber}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="airline"
              placeholder="Airline Name"
              value={formData.airline}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="departureCity"
              placeholder="Departure City"
              value={formData.departureCity}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="destinationCity"
              placeholder="Destination City"
              value={formData.destinationCity}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleInputChange}
              onBlur={calculateDuration}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="datetime-local"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleInputChange}
              onBlur={calculateDuration}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="duration"
              placeholder="Duration (e.g., 2h 30m)"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              name="price"
              placeholder="Price per seat"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              name="totalSeats"
              placeholder="Total Seats"
              value={formData.totalSeats}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              min="1"
            />
          </div>

          <div className="relative">
            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="aircraft"
              placeholder="Aircraft Type (e.g., Boeing 737)"
              value={formData.aircraft}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <input
              type="text"
              name="gate"
              placeholder="Gate (optional)"
              value={formData.gate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Saving...' : (flightToEdit ? 'Update Flight' : 'Add Flight')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlightForm;