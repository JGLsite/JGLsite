import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, CheckCircle, Clock, X, Plus, Edit, Trash2, Users } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  isApproved: boolean;
  adminId?: string;
  createdAt: string;
  memberCount: number;
  activeEvents: number;
}

export const GymManagement: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([
    {
      id: 'gym-1',
      name: 'Elite Gymnastics Center',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      contactEmail: 'info@elitegymnastics.com',
      contactPhone: '(555) 123-4567',
      website: 'www.elitegymnastics.com',
      isApproved: true,
      adminId: 'admin-1',
      createdAt: '2024-01-15',
      memberCount: 45,
      activeEvents: 3
    },
    {
      id: 'gym-2',
      name: 'Metro Sports Complex',
      address: '456 Oak Avenue',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      contactEmail: 'contact@metrosports.com',
      contactPhone: '(555) 987-6543',
      website: 'www.metrosports.com',
      isApproved: true,
      adminId: 'admin-2',
      createdAt: '2024-02-01',
      memberCount: 38,
      activeEvents: 2
    },
    {
      id: 'gym-3',
      name: 'Sunshine Gymnastics Academy',
      address: '789 Pine Road',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      contactEmail: 'hello@sunshinegym.com',
      contactPhone: '(555) 456-7890',
      isApproved: false,
      createdAt: '2024-03-10',
      memberCount: 0,
      activeEvents: 0
    },
    {
      id: 'gym-4',
      name: 'Pacific Coast Gymnastics',
      address: '321 Beach Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      contactEmail: 'info@pacificcoast.com',
      contactPhone: '(555) 321-0987',
      website: 'www.pacificcoast.com',
      isApproved: true,
      adminId: 'admin-4',
      createdAt: '2024-01-20',
      memberCount: 52,
      activeEvents: 4
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactEmail: '',
    contactPhone: '',
    website: ''
  });

  const filteredGyms = gyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gym.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gym.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'approved' && gym.isApproved) ||
                         (filterStatus === 'pending' && !gym.isApproved);
    return matchesSearch && matchesFilter;
  });

  const approveGym = (gymId: string) => {
    setGyms(prev => prev.map(gym => 
      gym.id === gymId ? { ...gym, isApproved: true } : gym
    ));
  };

  const rejectGym = (gymId: string) => {
    if (confirm('Are you sure you want to reject this gym application?')) {
      setGyms(prev => prev.filter(gym => gym.id !== gymId));
    }
  };

  const deleteGym = (gymId: string) => {
    if (confirm('Are you sure you want to delete this gym? This action cannot be undone.')) {
      setGyms(prev => prev.filter(gym => gym.id !== gymId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGym) {
      // Update existing gym
      setGyms(prev => prev.map(gym => 
        gym.id === editingGym.id 
          ? { ...gym, ...formData }
          : gym
      ));
      setEditingGym(null);
    } else {
      // Create new gym
      const newGym: Gym = {
        id: `gym-${Date.now()}`,
        ...formData,
        isApproved: false,
        createdAt: new Date().toISOString().split('T')[0],
        memberCount: 0,
        activeEvents: 0
      };
      setGyms(prev => [...prev, newGym]);
    }
    
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactEmail: '',
      contactPhone: '',
      website: ''
    });
    setShowCreateForm(false);
  };

  const startEdit = (gym: Gym) => {
    setEditingGym(gym);
    setFormData({
      name: gym.name,
      address: gym.address,
      city: gym.city,
      state: gym.state,
      zipCode: gym.zipCode,
      contactEmail: gym.contactEmail,
      contactPhone: gym.contactPhone || '',
      website: gym.website || ''
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingGym(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactEmail: '',
      contactPhone: '',
      website: ''
    });
  };

  const stats = {
    total: gyms.length,
    approved: gyms.filter(g => g.isApproved).length,
    pending: gyms.filter(g => !g.isApproved).length,
    totalMembers: gyms.reduce((sum, g) => sum + g.memberCount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gym Management</h1>
          <p className="text-gray-600 mt-1">Manage gymnastics facilities across the league</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Gym</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gyms</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalMembers}</p>
            </div>
            <Users className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search gyms by name, city, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Gyms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGyms.map((gym) => (
          <div key={gym.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{gym.name}</h3>
                <div className="flex items-center space-x-2">
                  {gym.isApproved ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Approved</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{gym.address}, {gym.city}, {gym.state} {gym.zipCode}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{gym.contactEmail}</span>
                </div>
                {gym.contactPhone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{gym.contactPhone}</span>
                  </div>
                )}
                {gym.website && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{gym.website}</span>
                  </div>
                )}
              </div>

              {gym.isApproved && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{gym.memberCount}</div>
                    <div className="text-sm text-gray-600">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{gym.activeEvents}</div>
                    <div className="text-sm text-gray-600">Active Events</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Added: {new Date(gym.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  {!gym.isApproved && (
                    <>
                      <button
                        onClick={() => approveGym(gym.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectGym(gym.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => startEdit(gym)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteGym(gym.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Gym Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingGym ? 'Edit Gym' : 'Add New Gym'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gym Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter gym name"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter street address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter state"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter ZIP code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={cancelEdit}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                {editingGym ? 'Update Gym' : 'Create Gym'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};