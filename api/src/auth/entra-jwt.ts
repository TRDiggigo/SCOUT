import { mapClaimsToInternalRoles, type InternalRole } from './role-mapper.js';

export interface AuthUserContext {
  userId: string;
  roles: InternalRole[];
  authProvider: 'mock' | 'entra-placeholder';
  tokenSubject?: string;
}

export interface JwtClaims {
  sub?: string;
  oid?: string;
  roles?: unknown;
  groups?: unknown;
}

function decodeJwtPayload(token: string): JwtClaims {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Token format is invalid.');
  }

  const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
  return JSON.parse(payload) as JwtClaims;
}

export function verifyEntraJwtPlaceholder(token: string): AuthUserContext {
  const claims = decodeJwtPayload(token);
  const tokenSubject = claims.oid ?? claims.sub;

  if (!tokenSubject) {
    throw new Error('Token does not contain subject information.');
  }

  return {
    userId: tokenSubject,
    roles: mapClaimsToInternalRoles(claims),
    authProvider: 'entra-placeholder',
    tokenSubject,
  };
}
