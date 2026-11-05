import type { ApiResponse } from "@/types/common";

export type UserRole = "customer" | "agent" | "staff" | "admin";
export type UserStatus = "active" | "deactivated";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponseEnvelope<T> extends ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type AuthUserResponse = AuthResponseEnvelope<AuthUser>;
export type UserProfileResponse = AuthResponseEnvelope<UserProfile>;
export type MessageResponse = AuthResponseEnvelope<null>;
