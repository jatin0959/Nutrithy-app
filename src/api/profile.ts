// src/api/profile.ts
import { api } from './client';

// Shape you send to backend for profile update
export type ProfileUpdatePayload = {
  name: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  goals: string[];
  interests: string[];
  dietPreference?: string;
  activityLevel?: string;
  sleepHours?: string;
  wizardCompleted: boolean;
};

export type EmployeeProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  companyId: string;
  company: string;
  companyName: string;
  avatar?: string;
  profilePhoto?: string;
  profile?: {
    gender?: string;
    ageYears?: number;
    weightKg?: number;
    heightCm?: number;
    phone?: string;
  };
  goals?: string[];
  interests?: string[];
  dietPreference?: string;
  activityLevel?: string;
  sleepHours?: string;
  wizardCompleted?: boolean;
  stats?: {
    totalPoints?: number;
    challengesCompleted?: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

// GET /api/employee/me → { data: { ... } }
export async function getProfile(): Promise<EmployeeProfile> {
  const res = await api.get('/api/employee/me');
  return res.data.data;
}

// Adjust response type if your backend returns something specific
export async function updateProfile(payload: ProfileUpdatePayload) {
  const res = await api.put('/api/employee/me/profile', payload);
  return res.data;
}
