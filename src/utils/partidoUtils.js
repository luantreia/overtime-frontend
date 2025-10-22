export function normalizeEquipoNombre(equipo, nombrePlano, fallback = 'Equipo') {
  const isObjectId = (valor) => typeof valor === 'string' && /^[0-9a-fA-F]{24}$/.test(valor);

  if (typeof nombrePlano === 'string' && nombrePlano.trim() && !isObjectId(nombrePlano)) {
    return nombrePlano.trim();
  }

  if (!equipo) {
    return fallback;
  }

  const candidatos = [];

  if (typeof equipo === 'string') {
    candidatos.push(equipo);
  } else if (Array.isArray(equipo)) {
    candidatos.push(...equipo);
  } else if (typeof equipo === 'object') {
    candidatos.push(
      equipo.nombre,
      equipo.equipoNombre,
      equipo.displayName,
      equipo.teamName,
      equipo.teamDisplayName,
      equipo?.detalle?.nombre
    );

    if (Array.isArray(equipo?.nombre)) {
      candidatos.push(equipo.nombre.join(' '));
    }
  }

  const nombreValido = candidatos
    .filter((valor) => typeof valor === 'string' && valor.trim().length > 0)
    .map((valor) => valor.trim())
    .find((valor) => !isObjectId(valor));

  return nombreValido || fallback;
}
