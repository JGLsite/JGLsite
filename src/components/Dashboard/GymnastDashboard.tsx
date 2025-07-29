import React from 'react';
import { useState } from 'react';
import { Trophy, Calendar, Star, Target, Award, TrendingUp } from 'lucide-react';
import { useChallenges, useNotifications } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';

export const GymnastDashboard: React.FC = () => {
  const { user } = useAuth();
  const { challenges } = useChallenges();
  const { notifications } = useNotifications();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    event: '',
    level: '',
    notes: ''
  });
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    emergencyContact: '',
    medicalNotes: ''
  });

  const stats = [
    { label: 'Total Points', value: '987', icon: Trophy, color: 'bg-yellow-500', change: 'Keep earning!' },
    { label: 'Available Challenges', value: challenges.length.toString(), icon: Target, color: 'bg-green-500', change: 'Ready to start' },
    { label: 'Upcoming Events', value: '2', icon: Calendar, color: 'bg-blue-500', change: 'Next: March 15' },
    { label: 'League Rank', value: '#12', icon: Award, color: 'bg-purple-500', change: '+3 positions' },
  ];

  const upcomingEvents = [
    { name: 'Spring Championship', date: 'March 15, 2024', location: 'Elite Gymnastics Center', status: 'registered' },
    { name: 'Regional Qualifier', date: 'April 2, 2024', location: 'Metro Sports Complex', status: 'pending' },
  ];

  const availableChallenges = challenges.slice(0, 3).map(challenge => ({
    title: challenge.title,
    points: challenge.points,
    difficulty: challenge.difficulty?.charAt(0).toUpperCase() + challenge.difficulty?.slice(1) || 'Beginner',
    description: challenge.description
  }));

  const recentAchievements = notifications.filter(n => n.type === 'success').slice(0, 3).map(notif => ({
    title: notif.title,
    points: 50, // Would extract from message in real implementation
    earnedAt: new Date(notif.created_at).toLocaleDateString(),
    type: 'achievement'
  }));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRegisterForEvent = () => {
    setShowRegisterModal(true);
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
  };

  const handleSubmitRegistration = () => {
    alert(`Registration submitted for ${registrationData.event}! Waiting for coach approval.`);
    setShowRegisterModal(false);
    setRegistrationData({ event: '', level: '', notes: '' });
  };

  const handleUpdateProfile = () => {
    alert(`Profile updated successfully!`);
    setShowProfileModal(false);
  };

  const startChallenge = (challengeTitle: string) => {
    alert(`Started challenge: ${challengeTitle}! Good luck!`);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleRegisterForEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register for Event
          </button>
          <button 
            onClick={handleViewProfile}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'registered' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.date}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Challenges */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Challenges</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {availableChallenges.map((challenge, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-sm font-medium text-yellow-600">{challenge.points} pts</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                  <button 
                    onClick={() => startChallenge(challenge.title)}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start Challenge
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-yellow-700 font-medium">+{achievement.points} points</p>
                    <p className="text-xs text-gray-500">{achievement.earnedAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Register for Event Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Register for Event</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                <select
                  value={registrationData.event}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, event: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose an event</option>
                  <option value="Spring Championship 2024">Spring Championship 2024</option>
                  <option value="Regional Qualifier">Regional Qualifier</option>
                  <option value="Summer Invitational">Summer Invitational</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Competition Level</label>
                <select
                  value={registrationData.level}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your level</option>
                  <option value="Level 4">Level 4</option>
                  <option value="Level 5">Level 5</option>
                  <option value="Level 6">Level 6</option>
                  <option value="Level 7">Level 7</option>
                  <option value="Level 8">Level 8</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  rows={4}
                  value={registrationData.notes}
                  onChange={(e) => setRegistrationData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requirements or notes for your coach..."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your registration will be sent to your coach for approval. 
                  You'll receive a notification once it\'s reviewed.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegistrationData({ event: '', level: '', notes: '' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRegistration}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Emergency contact number"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Notes</label>
                  <textarea
                    rows={3}
                    value={profileData.medicalNotes}
                    onChange={(e) => setProfileData(prev => ({ ...prev, medicalNotes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any medical conditions or allergies..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};