export function normalizeUser(rawUser = {}) {
  return {
    id: rawUser.id || rawUser.userId || null,
    fullName: rawUser.fullName || rawUser.name || '',
    email: rawUser.email || '',
    avatarUrl: rawUser.avatarUrl || rawUser.avatar || '',
    roleName: rawUser.roleName || rawUser.role || 'User',
  };
}
