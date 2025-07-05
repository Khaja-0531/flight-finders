import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginRegister from './components/LoginRegister';
import Navigation from './components/Navigation';
import FlightSearch from './components/FlightSearch';
import BookingModal from './components/BookingModal';
import UserBookings from './components/UserBookings';
import AdminDashboard from './components/AdminDashboard';
import FlightForm from './components/FlightForm';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('home');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  if (!user) {
    return <LoginRegister onSuccess={() => {}} />;
  }

  const handleFlightSelect = (flight: any) => {
    setSelectedFlight(flight);
    setShowBookingModal(true);
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    setSelectedFlight(null);
    if (activeView !== 'bookings') {
      setActiveView('bookings');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to SkyBook
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Your gateway to seamless flight booking experience
              </p>
              
              {user.role === 'user' && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">Ready to fly?</h2>
                  <p className="mb-6">Search and book flights to your favorite destinations</p>
                  <button
                    onClick={() => setActiveView('search')}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                  >
                    Search Flights
                  </button>
                </div>
              )}

              {user.role === 'admin' && (
                <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                  <p className="mb-6">Manage flights, users, and bookings</p>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                  >
                    View Dashboard
                  </button>
                </div>
              )}

              {user.role === 'flight_operator' && (
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">Flight Operator Panel</h2>
                  <p className="mb-6">Manage your flights and schedules</p>
                  <button
                    onClick={() => setActiveView('add-flight')}
                    className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                  >
                    Add New Flight
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'search':
        return <FlightSearch onFlightSelect={handleFlightSelect} />;

      case 'bookings':
        return <UserBookings />;

      case 'dashboard':
        return <AdminDashboard />;

      case 'add-flight':
        return <FlightForm onFlightAdded={() => setActiveView('home')} />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600">
              This feature is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Navigation activeView={activeView} onViewChange={setActiveView} />
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedFlight && (
        <BookingModal
          flight={selectedFlight}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedFlight(null);
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;