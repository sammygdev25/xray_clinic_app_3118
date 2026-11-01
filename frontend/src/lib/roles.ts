// The app's roles for its pages, from the plan like backend/src/access.ts (generated). Hiding a page is for the
// person using the app; the server checks the role on every request.
export const ROLES = ['patient', 'receptionist', 'radiologist'] as const;
export const STAFF_ROLES: readonly string[] = ['receptionist', 'radiologist'];
export const HOME_BY_ROLE: Record<string, string> = { patient: '/', receptionist: '/staff/rooms', radiologist: '/staff/rooms' };

export function homeFor(role: string | null | undefined): string {
  return (role && HOME_BY_ROLE[role]) || '/';
}
