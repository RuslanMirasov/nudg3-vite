import { api } from '@/shared/lib/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  User,
  ChangePasswordRequest,
  ChangePasswordResponse,
  PasswordSetResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailResponse,
} from '@/features/auth/types/auth';

export const authApi = {
  // GET
  getCurrentUser: () => api.get<User>('/auth/me'),
  verifyEmail: (token: string) => api.get<VerifyEmailResponse>('/auth/verify', { token }),

  // POST
  login: (credentials: LoginRequest) => api.post<LoginResponse>('/auth/login', credentials),
  setInitialPassword: (password: string) => api.post<PasswordSetResponse>('/auth/set-password', { password }),
  signup: (data: SignupRequest) => api.post<SignupResponse>('/auth/signup', data),
  resendVerification: (email: string) => api.post<{ message: string }>('/auth/resend-verification', { email }),
  requestPasswordReset: (email: string) => api.post<{ message: string }>('/auth/request-password-reset', { email }),
  resetPassword: (token: string, new_password: string) => api.post<{ message: string }>('/auth/reset-password', { token, new_password }),

  // PUT
  changePassword: (data: ChangePasswordRequest) => api.put<ChangePasswordResponse>('/auth/change-password', data),
};
