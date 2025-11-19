// src/types/index.ts

// --- AUTH / USER TYPES ---

export type EmployeeUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  teamId?: string;
  needsProfileSetup: boolean;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyCode: string;
  employeeId?: string;
  rememberMe?: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: EmployeeUser;
};
