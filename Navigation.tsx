import React from 'react';
import { 
  Home, 
  Search, 
  Calendar, 
  Settings, 
  LogOut, 
  Plane,
  Users,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'home', label: 'Home', icon: Home },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { id: 'dashboard', label: 'Dashboard', icon: Settings },
          { id: 'add-flight', label: 'Add Flight', icon: Plus },
          { id: 'users', label: 'Users', icon: Users },
        ];
      
      case 'flight_operator':
        return [
          ...baseItems,
          { id: 'my-flights', label: 'My Flights', icon: Plane },
          { id: 'add-flight', label: 'Add Flight', icon: Plus },
        ];
      
      default: // user
        return [
          ...baseItems,
          { id: 'search', label: 'Search Flights', icon: Search },
          { id: 'bookings', label: 'My Bookings', icon: Calendar },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white shadow-lg rounded-xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">SkyBook</h2>
            <p className="text-sm text-gray-600">Welcome, {user?.firstName}!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeView === item.id
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;