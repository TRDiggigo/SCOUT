export const INTERNAL_ROLES = [
  'ROLE_VIEWER',
  'ROLE_ANALYST',
  'ROLE_LEAD_ANALYST',
  'ROLE_OPERATOR',
  'ROLE_ADMIN',
  'ROLE_GOVERNANCE_OWNER',
] as const;

export type InternalRole = (typeof INTERNAL_ROLES)[number];
