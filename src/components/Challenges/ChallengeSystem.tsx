import React, { useState } from 'react';
import { Trophy, Star, Target, Award, Clock, CheckCircle, Play } from 'lucide-react';
import { useChallenges } from '../../hooks/useSupabaseData';

export const ChallengeSystem: React.FC = () => {
  const { challenges, loading, error } = useChallenges();
  const [activeTab, setActiveTab] = useState('available');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading challenges: {error}
      </div>
    );
  }

  const myProgress = [
    {
      id: '4',
      title: 'Vault Power',
      description: 'Execute 10 perfect vaults with consistent form',
      points: 60,
      difficulty: 'Intermediate',
      progress: 70,
      status: 'in_progress',
      startedAt: '3 days ago',
    },
    {
      id: '5',
      title: 'Floor Routine Excellence',
      description: 'Perform floor routine with no deductions',
      points: 100,
      difficulty: 'Advanced',
      progress: 100,
      status: 'completed',
      completedAt: '1 week ago',
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah Johnson', points: 1247, badges: 8 },
    { rank: 2, name: 'Emma Davis', points: 1156, badges: 7 },
    { rank: 3, name: 'Mia Rodriguez', points: 1089, badges: 6 },
    { rank: 4, name: 'You', points: 987, badges: 5, isCurrentUser: true },
    { rank: 5, name: 'Olivia Chen', points: 923, badges: 4 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <Play className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gymnastics Challenges</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Your Points: <span className="font-bold text-yellow-600">987</span>
          </div>
          <div className="text-sm text-gray-600">
            Rank: <span className="font-bold text-purple-600">#4</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'available', label: 'Available Challenges', icon: Target },
            { id: 'progress', label: 'My Progress', icon: Clock },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Available Challenges */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty?.charAt(0).toUpperCase() + challenge.difficulty?.slice(1) || 'Beginner')}`}>
                    {challenge.difficulty?.charAt(0).toUpperCase() + challenge.difficulty?.slice(1)}
                  </span>
                  <span className="text-sm font-medium text-yellow-600">{challenge.points} pts</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Category: {challenge.category || 'General'}</span>
                <span>Time limit: {challenge.time_limit_days ? `${challenge.time_limit_days} days` : 'No limit'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Active challenge
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Start Challenge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Progress */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {myProgress.map((challenge) => (
            <div key={challenge.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(challenge.status)}
                  <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-sm font-medium text-yellow-600">{challenge.points} pts</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              
              {challenge.status === 'in_progress' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                {challenge.status === 'completed' 
                  ? `Completed ${challenge.completedAt}`
                  : `Started ${challenge.startedAt}`
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Challenge Leaderboard</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div 
                  key={entry.rank} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      entry.rank === 1 ? 'bg-yellow-500 text-white' :
                      entry.rank === 2 ? 'bg-gray-400 text-white' :
                      entry.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <p className={`font-medium ${entry.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                        {entry.name}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Award className="w-4 h-4" />
                        <span>{entry.badges} badges earned</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{entry.points.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};