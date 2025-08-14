// Auth-specific types

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
  expiresAt?: string;
}

export interface ShopifyAuthData {
  shop: string;
  accessToken: string;
  customerId?: string;
}

export interface AuthPermission {
  canAccessQuests: boolean;
  canAccessAdmin: boolean;
  canUploadMedia: boolean;
  canCheckIn: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
