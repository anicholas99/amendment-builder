export const userKeys = {
  all: ['users'] as const,
  current: () => ['currentUser'] as const,
  tenants: (userId: string) => ['userTenants', userId] as const,
  preferences: (userId: string) => ['userPreferences', userId] as const,
};
