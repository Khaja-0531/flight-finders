import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

interface Booking {
  _id: string;
  bookingReference: string;
  flight: {
    flightNumber: string;
    airline: string;
    departureCity: string;
    destinationCity: string;
    departureTime: string;
    arrivalTime: string;
    status: string;
  };
  passengers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
  }>;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: string;
  bookingDate: string;
  cancellationDate?: string;
  cancellationReason?: string;
}

const UserBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/my-bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setCancellingId(selectedBooking);
    try {
      await axios.put(`http://localhost:5000/api/bookings/${selectedBooking}/cancel`, {
        reason: cancelReason
      });
      
      await fetchBookings();
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelModal = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setShowCancelModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelBooking = (booking: Booking) => {
    const departureTime = new Date(booking.flight.departureTime);
    const now = new Date();
    const hoursDifference = (departureTime.getTime() - now.getTime()) / (1000 * 3600);
    
    return booking.status === 'confirmed' && hoursDifference > 24;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <div className="text-sm text-gray-500">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Book your first flight to see it here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {booking.flight.airline}
                    </div>
                    <span className="font-mono text-gray-600">{booking.flight.flightNumber}</span>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Departure</span>
                      </p>
                      <p className="font-semibold">{booking.flight.departureCity}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.flight.departureTime)} at {formatTime(booking.flight.departureTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Arrival</span>
                      </p>
                      <p className="font-semibold">{booking.flight.destinationCity}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.flight.arrivalTime)} at {formatTime(booking.flight.arrivalTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Passengers</span>
                      </p>
                      <p className="font-semibold">{booking.passengers.length}</p>
                      <p className="text-sm text-gray-600">
                        {booking.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Booking Ref:</span> {booking.bookingReference}
                    </div>
                    <div>
                      <span className="font-medium">Booked:</span> {formatDate(booking.bookingDate)}
                    </div>
                  </div>

                  {booking.status === 'cancelled' && booking.cancellationReason && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Cancellation reason:</span> {booking.cancellationReason}
                      </p>
                      {booking.cancellationDate && (
                        <p className="text-xs text-red-600 mt-1">
                          Cancelled on {formatDate(booking.cancellationDate)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-3 lg:ml-8">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${booking.totalAmount}</p>
                    <p className="text-sm text-gray-500">Total amount</p>
                  </div>

                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => openCancelModal(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Enter reason for cancellation..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancellingId !== null}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {cancellingId ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;