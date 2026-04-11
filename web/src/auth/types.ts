import type { InternalRole } from './roles';

export interface AuthUser {
  userId: string;
  roles: InternalRole[];
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
}
