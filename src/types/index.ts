export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'gym_admin' | 'coach' | 'gymnast' | 'host';
  gymId?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactEmail: string;
  contactPhone: string;
  isApproved: boolean;
  adminId: string;
  createdAt: string;
}

export interface Gymnast {
  id: string;
  userId: string;
  gymId: string;
  birthDate: string;
  level: string;
  isTeamMember: boolean;
  approvedByCoach: boolean;
  membershipStatus: 'pending' | 'active' | 'inactive';
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  hostGymId: string;
  registrationDeadline: string;
  maxParticipants?: number;
  entryFee: number;
  ticketPrice: number;
  status: 'draft' | 'open' | 'closed' | 'completed';
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  gymnastId: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ChallengeCompletion {
  id: string;
  challengeId: string;
  gymnastId: string;
  completedAt: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}