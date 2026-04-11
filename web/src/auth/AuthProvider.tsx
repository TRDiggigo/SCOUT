import { createContext, useContext, type PropsWithChildren } from 'react';

import type { AuthContextValue } from './types';
import { INTERNAL_ROLES } from './roles';

const defaultAuthContext: AuthContextValue = {
  isAuthenticated: true,
  user: {
    userId: 'mock-developer',
    roles: [...INTERNAL_ROLES],
  },
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

interface AuthProviderProps extends PropsWithChildren {
  value?: AuthContextValue;
}

export function AuthProvider({ value, children }: AuthProviderProps): JSX.Element {
  return <AuthContext.Provider value={value ?? defaultAuthContext}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
