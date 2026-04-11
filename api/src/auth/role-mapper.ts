export const INTERNAL_ROLES = [
  'ROLE_VIEWER',
  'ROLE_ANALYST',
  'ROLE_LEAD_ANALYST',
  'ROLE_OPERATOR',
  'ROLE_ADMIN',
  'ROLE_GOVERNANCE_OWNER',
] as const;

export type InternalRole = (typeof INTERNAL_ROLES)[number];

type ClaimsLike = {
  roles?: unknown;
  groups?: unknown;
};

const CLAIM_TO_ROLE: Record<string, InternalRole> = {
  ROLE_VIEWER: 'ROLE_VIEWER',
  ROLE_ANALYST: 'ROLE_ANALYST',
  ROLE_LEAD_ANALYST: 'ROLE_LEAD_ANALYST',
  ROLE_OPERATOR: 'ROLE_OPERATOR',
  ROLE_ADMIN: 'ROLE_ADMIN',
  ROLE_GOVERNANCE_OWNER: 'ROLE_GOVERNANCE_OWNER',
};

function isInternalRole(value: string): value is InternalRole {
  return INTERNAL_ROLES.includes(value as InternalRole);
}

function normalizeClaimValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
}

export function mapClaimsToInternalRoles(claims: ClaimsLike): InternalRole[] {
  const roleClaims = normalizeClaimValues(claims.roles);
  const groupClaims = normalizeClaimValues(claims.groups);

  const mapped = [...roleClaims, ...groupClaims]
    .map((claim) => CLAIM_TO_ROLE[claim] ?? claim)
    .filter(isInternalRole);

  return Array.from(new Set(mapped));
}
