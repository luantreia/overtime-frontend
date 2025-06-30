// utils/permisos.js
export function puedeEditarEntidad(user, entidadId, entidadKey = 'adminCompetencias') {
  return user?.rol === 'admin' || user?.[entidadKey]?.includes(entidadId);
}
