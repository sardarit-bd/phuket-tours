import type { ApiResponse } from "@/types/common";

export type UserRole = "customer" | "agent" | "staff" | "admin";
export type UserStatus = "active" | "deactivated";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface AvatarSignatureResponse {
  uploadUrl: string;
  signature: string;
  timestamp: number;
  apiKey: string;
  folder: string;
  publicId: string;
  uploadToken: string;
}

export interface ConfirmAvatarRequest {
  uploadToken: string;
  publicId: string;
  secureUrl: string;
  format?: string;
  bytes?: number;
}

export interface AuthResponseEnvelope<T> extends ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type AuthUserResponse = AuthResponseEnvelope<AuthUser>;
export type UserProfileResponse = AuthResponseEnvelope<UserProfile>;
export type MessageResponse = AuthResponseEnvelope<null>;
