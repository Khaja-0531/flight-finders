import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import axios from 'axios';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  aircraft: string;
  gate?: string;
}

interface FlightSearchProps {
  onFlightSelect: (flight: Flight) => void;
}

const FlightSearch: React.FC<FlightSearchProps> = ({ onFlightSelect }) => {
  const [searchData, setSearchData] = useState({
    departureCity: '',
    destinationCity: '',
    departureDate: '',
    passengers: 1
  });
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (searchData.departureCity) params.append('departureCity', searchData.departureCity);
      if (searchData.destinationCity) params.append('destinationCity', searchData.destinationCity);
      if (searchData.departureDate) params.append('departureDate', searchData.departureDate);
      
      const response = await axios.get(`http://localhost:5000/api/flights/search?${params}`);
      setFlights(response.data.flights);
      setSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
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

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Flights</h2>
        
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="departureCity"
                placeholder="From"
                value={searchData.departureCity}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="destinationCity"
                placeholder="To"
                value={searchData.destinationCity}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="departureDate"
                value={searchData.departureDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="passengers"
                value={searchData.passengers}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                {[1,2,3,4,5,6,7,8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>{loading ? 'Searching...' : 'Search Flights'}</span>
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searched && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {flights.length > 0 ? `Found ${flights.length} flights` : 'No flights found'}
          </h3>
          
          {flights.map((flight) => (
            <div key={flight._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {flight.airline}
                    </div>
                    <span className="text-gray-600 font-mono">{flight.flightNumber}</span>
                    <span className="text-gray-500">{flight.aircraft}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Departure</p>
                      <p className="text-lg font-semibold">{formatTime(flight.departureTime)}</p>
                      <p className="text-sm text-gray-600">{flight.departureCity}</p>
                      <p className="text-xs text-gray-500">{formatDate(flight.departureTime)}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-lg font-semibold">{flight.duration}</p>
                      <div className="flex items-center justify-center mt-2">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <div className="mx-2 w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                    </div>
                    
                    <div className="text-right md:text-left">
                      <p className="text-sm text-gray-500">Arrival</p>
                      <p className="text-lg font-semibold">{formatTime(flight.arrivalTime)}</p>
                      <p className="text-sm text-gray-600">{flight.destinationCity}</p>
                      <p className="text-xs text-gray-500">{formatDate(flight.arrivalTime)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 lg:ml-8">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${flight.price}</p>
                    <p className="text-sm text-gray-500">per person</p>
                  </div>
                  
                  <p className="text-sm text-green-600">
                    {flight.availableSeats} seats available
                  </p>
                  
                  {flight.gate && (
                    <p className="text-sm text-gray-500">Gate {flight.gate}</p>
                  )}
                  
                  <button
                    onClick={() => onFlightSelect(flight)}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    Book Flight
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightSearch;