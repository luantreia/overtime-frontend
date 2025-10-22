// src/utils/formatters/index.js
// Funciones de formateo reutilizables

/**
 * Formatea una fecha en formato legible
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('es-ES', defaultOptions).format(new Date(date));
};

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-ES').format(number);
};

/**
 * Trunca texto a una longitud máxima
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Formatea duración en minutos a formato legible
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0min';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}min`;
};

/**
 * Formatea porcentaje
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formatea nombre de jugador (inicial + apellido)
 */
export const formatPlayerName = (player) => {
  if (!player) return 'Jugador';

  if (player.nombre && player.apellido) {
    return `${player.nombre.charAt(0)}. ${player.apellido}`;
  }

  if (player.nombre) {
    const partes = player.nombre.trim().split(' ');
    if (partes.length > 1) {
      return `${partes[0].charAt(0)}. ${partes[partes.length - 1]}`;
    }
    return player.nombre;
  }

  return 'Jugador';
};

/**
 * Formatea estadísticas de equipo
 */
export const formatTeamStats = (stats) => {
  if (!stats) return {};

  return {
    partidos: formatNumber(stats.totalPartidos || 0),
    victorias: formatNumber(stats.partidosGanados || 0),
    derrotas: formatNumber(stats.partidosPerdidos || 0),
    empates: formatNumber(stats.partidosEmpatados || 0),
    ratio: stats.totalPartidos > 0 ? formatPercentage(stats.partidosGanados / stats.totalPartidos) : '0.0%'
  };
};
