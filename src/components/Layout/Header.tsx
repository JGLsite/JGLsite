import React from 'react';
import { LogOut, User, Trophy, Calendar, Users, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Trophy },
      { id: 'events', label: 'Events', icon: Calendar },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'gyms', label: 'Gyms', icon: Users },
        { id: 'members', label: 'Members', icon: User },
        { id: 'communications', label: 'Communications', icon: Users },
      ];
    }

    if (user?.role === 'coach' || user?.role === 'gym_admin') {
      return [
        ...baseItems,
        { id: 'gymnasts', label: 'My Gymnasts', icon: Users },
        { id: 'registrations', label: 'Registrations', icon: Calendar },
      ];
    }

    if (user?.role === 'gymnast') {
      return [
        ...baseItems,
        { id: 'challenges', label: 'Challenges', icon: Trophy },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }

    return baseItems;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30" />
                <Trophy className="relative w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Jewish Gymnastics League
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Management Portal</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              {getNavItems().map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="text-sm text-gray-600">
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500 -mt-1">
                  {user?.email}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-xs font-medium">
                {user?.role.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};