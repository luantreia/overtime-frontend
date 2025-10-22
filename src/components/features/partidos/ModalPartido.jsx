// src/components/features/partidos/ModalPartido.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ModalLayout from '../../common/ModalLayout';
import PartidoStats from './components/PartidoStats';
import { Card, Badge, Button } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { formatDate } from '../../../utils';
import useJugadores from '../../../hooks/jugadores/useJugadores';
import { fetchPartidosPorEquipo } from '../../../services/partidoService';
import { normalizeEquipoNombre } from '../../../utils/partidoUtils';

function ModalPartido({ partido: partidoProp, onClose }) {
  const [partido, setPartido] = useState(partidoProp);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ultimosLocal, setUltimosLocal] = useState([]);
  const [ultimosVisitante, setUltimosVisitante] = useState([]);

  const { token } = useAuth();
  const { jugadores } = useJugadores(token);

  useEffect(() => {
    setPartido(partidoProp);
  }, [partidoProp]);

  useEffect(() => {
    async function cargarEstadisticas() {
      if (!partido?._id || !token) return;

      try {
        setLoading(true);
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partido._id}/estadisticas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener estadísticas del partido');
        const data = await res.json();
        setEstadisticas(data);
      } catch (err) {
        console.error('Error al obtener estadísticas del partido:', err);
        setEstadisticas(null);
      } finally {
        setLoading(false);
      }
    }

    cargarEstadisticas();
  }, [partido?._id, token]);

  useEffect(() => {
    async function cargarUltimos() {
      if (!token || !partido) return;
      const idLocal = partido?.equipoLocal?._id || partido?.equipoLocal;
      const idVisitante = partido?.equipoVisitante?._id || partido?.equipoVisitante;
      try {
        if (idLocal) {
          const lista = await fetchPartidosPorEquipo(idLocal, token);
          const ordenados = [...lista]
            .filter(p => p._id !== partido._id)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);
          setUltimosLocal(ordenados);
        }
        if (idVisitante) {
          const lista = await fetchPartidosPorEquipo(idVisitante, token);
          const ordenados = [...lista]
            .filter(p => p._id !== partido._id)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);
          setUltimosVisitante(ordenados);
        }
      } catch (e) {
        setUltimosLocal([]);
        setUltimosVisitante([]);
      }
    }
    cargarUltimos();
  }, [partido?._id, partido?.equipoLocal, partido?.equipoVisitante, token]);

  const jugadoresLocal = useMemo(() => {
    const id = partido?.equipoLocal?._id || partido?.equipoLocal;
    return Array.isArray(jugadores) && id
      ? jugadores.filter(j => (j.equipo?._id || j.equipo) === id)
      : [];
  }, [jugadores, partido?.equipoLocal]);

  const jugadoresVisitante = useMemo(() => {
    const id = partido?.equipoVisitante?._id || partido?.equipoVisitante;
    return Array.isArray(jugadores) && id
      ? jugadores.filter(j => (j.equipo?._id || j.equipo) === id)
      : [];
  }, [jugadores, partido?.equipoVisitante]);

  if (!partido) return null;

  const {
    equipoLocal,
    equipoVisitante,
    marcadorLocal,
    marcadorVisitante,
    fecha,
    estado,
    competencia,
    fase,
    sets = []
  } = partido;

  const fechaFormateada = formatDate(fecha, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-5xl">
      <div className="space-y-6">
        {/* Header con información básica del partido */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant={
                estado === 'en_vivo' ? 'success' :
                estado === 'finalizado' ? 'primary' :
                estado === 'cancelado' ? 'danger' : 'secondary'
              }
              size="lg"
            >
              {estado === 'en_vivo' ? 'En vivo' :
               estado === 'finalizado' ? 'Finalizado' :
               estado === 'cancelado' ? 'Cancelado' : 'Programado'}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {fechaFormateada}
            </span>
          </div>

          {/* Equipos enfrentados */}
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3">
                {equipoLocal?.escudo && (
                  <img
                    src={equipoLocal.escudo}
                    alt={equipoLocal.nombre}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {equipoLocal?.nombre || 'Equipo local'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Local
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {marcadorLocal || 0} - {marcadorVisitante || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">VS</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {equipoVisitante?.nombre || 'Equipo visitante'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visitante
                  </p>
                </div>
                {equipoVisitante?.escudo && (
                  <img
                    src={equipoVisitante.escudo}
                    alt={equipoVisitante.nombre}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Información de competencia */}
          {(competencia?.nombre || fase?.nombre) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              {competencia?.nombre && (
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {competencia.nombre}
                </p>
              )}
              {fase?.nombre && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {fase.nombre}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Estadísticas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PartidoStats
            partido={partido}
            stats={estadisticas}
            title="Estadísticas del Partido"
          />

          {/* Sets jugados */}
          <Card title={`Sets Jugados (${sets?.length || 0})`}>
            {sets && sets.length > 0 ? (
              <div className="space-y-2">
                {sets.map((set, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" size="sm">
                        Set {set.numeroSet || index + 1}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {set.puntuacionLocal || 0} - {set.puntuacionVisitante || 0}
                      </span>
                    </div>
                    <Badge
                      variant={
                        (set.puntuacionLocal || 0) > (set.puntuacionVisitante || 0) ? 'success' :
                        (set.puntuacionVisitante || 0) > (set.puntuacionLocal || 0) ? 'danger' : 'secondary'
                      }
                      size="sm"
                    >
                      {set.ganadorSet === 'local' ? 'Local' :
                       set.ganadorSet === 'visitante' ? 'Visitante' : 'Empate'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay sets registrados
              </p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={`Jugadores ${normalizeEquipoNombre(partido.equipoLocal, partido.equipoLocalNombre, 'Local')}`}>
            {jugadoresLocal.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {jugadoresLocal.map(j => (
                  <li key={j._id} className="py-1.5 flex justify-between">
                    <span className="text-gray-800 dark:text-gray-200">{j.nombre}</span>
                    <span className="text-gray-500 dark:text-gray-400">{j.posicion || ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-3">Sin jugadores asignados</p>
            )}
          </Card>

          <Card title={`Jugadores ${normalizeEquipoNombre(partido.equipoVisitante, partido.equipoVisitanteNombre, 'Visitante')}`}>
            {jugadoresVisitante.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {jugadoresVisitante.map(j => (
                  <li key={j._id} className="py-1.5 flex justify-between">
                    <span className="text-gray-800 dark:text-gray-200">{j.nombre}</span>
                    <span className="text-gray-500 dark:text-gray-400">{j.posicion || ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-3">Sin jugadores asignados</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={`Últimos partidos ${normalizeEquipoNombre(partido.equipoLocal, partido.equipoLocalNombre, 'Local')}`}>
            {ultimosLocal.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {ultimosLocal.map(p => {
                  const esLocal = (p.equipoLocal?._id || p.equipoLocal) === (partido.equipoLocal?._id || partido.equipoLocal);
                  const oponente = esLocal ? p.equipoVisitante : p.equipoLocal;
                  const nombreOponente = normalizeEquipoNombre(oponente, undefined, 'Oponente');
                  const ml = p.marcadorLocal ?? '-';
                  const mv = p.marcadorVisitante ?? '-';
                  const fechaCorta = new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  return (
                    <li key={p._id} className="py-1.5 flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200">{fechaCorta} · vs {nombreOponente}</span>
                      <span className="text-gray-600 dark:text-gray-300">{ml} - {mv}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-3">Sin partidos recientes</p>
            )}
          </Card>

          <Card title={`Últimos partidos ${normalizeEquipoNombre(partido.equipoVisitante, partido.equipoVisitanteNombre, 'Visitante')}`}>
            {ultimosVisitante.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {ultimosVisitante.map(p => {
                  const esVisita = (p.equipoVisitante?._id || p.equipoVisitante) === (partido.equipoVisitante?._id || partido.equipoVisitante);
                  const oponente = esVisita ? p.equipoLocal : p.equipoVisitante;
                  const nombreOponente = normalizeEquipoNombre(oponente, undefined, 'Oponente');
                  const ml = p.marcadorLocal ?? '-';
                  const mv = p.marcadorVisitante ?? '-';
                  const fechaCorta = new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                  return (
                    <li key={p._id} className="py-1.5 flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200">{fechaCorta} · vs {nombreOponente}</span>
                      <span className="text-gray-600 dark:text-gray-300">{ml} - {mv}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-3">Sin partidos recientes</p>
            )}
          </Card>
        </div>

        {/* Información adicional */}
        <Card title="Información Adicional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Fecha y hora:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Estado:</span>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {estado?.replace('_', ' ') || 'Desconocido'}
              </p>
            </div>

            {partido.lugar && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Lugar:</span>
                <p className="text-gray-600 dark:text-gray-400">{partido.lugar}</p>
              </div>
            )}

            {partido.arbitro && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Árbitro:</span>
                <p className="text-gray-600 dark:text-gray-400">{partido.arbitro}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ModalLayout>
  );
}

export default ModalPartido;
