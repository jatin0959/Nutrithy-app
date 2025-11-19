// src/api/wellness.ts
import { api } from './client';

export type DashboardResponse = {
  today: {
    steps: number;
    stepsGoal: number;
    activeMinutes: number;
    streakDays: number;
    sleepHours: number;
    bedtime: string;
    wakeTime: string;
    sleepConsistencyScore: number;
  };
  weekly: {
    steps: number[];
    sleepHours: number[];
    startDate: string;
    endDate: string;
  };
  stats: {
    coins: number;
    totalPoints: number;
    rank: number;
    activeFriendsOnChallenges: number;
  };
  tasks: {
    id: string;
    title: string;
    progressPct: number;
    completed: boolean;
    coins: number;
  }[];
};

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await api.get<{ data: DashboardResponse }>('/employee/wellness/dashboard');
  return res.data.data;
}
