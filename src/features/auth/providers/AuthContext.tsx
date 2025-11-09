import { createContext } from 'react';
import type { User } from '@/features/auth/types/auth';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUserData: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
