export const ROLES = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
} as const;

export const isAdmin = (m: { role: string }) => m.role === ROLES.ADMIN;
export const isMember = (m: { role: string }) => m.role === ROLES.MEMBER;
