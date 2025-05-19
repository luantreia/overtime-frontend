export function useUserRole(user) {
  if (!user) return { isAdmin: false, isReader: false };

  const isAdmin = user.rol === 'admin';
  const isReader = user.rol === 'lector';

  return { isAdmin, isReader };
}
