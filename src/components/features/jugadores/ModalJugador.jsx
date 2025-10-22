// src/components/features/jugadores/ModalJugador.jsx
import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import JugadorCard from './components/JugadorCard';
import JugadorStats from './components/JugadorStats';
import { Card, Badge } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useJugadorEquipo } from '../../../hooks/jugadores/useJugadoresEquipo';
import { normalizeEquipoNombre } from '../../../utils/partidoUtils';

function ModalJugador({ jugador: jugadorProp, onClose }) {
  const [jugador, setJugador] = useState(jugadorProp);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const { relaciones, loading: loadingRelaciones } = useJugadorEquipo({ jugadorId: jugador?._id, token });

  useEffect(() => {
    setJugador(jugadorProp);
  }, [jugadorProp]);

  useEffect(() => {
    async function cargarEstadisticas() {
      if (!jugador?._id || !token) return;

      try {
        setLoading(true);
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador/${jugador._id}/resumen`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener estadísticas del jugador');
        const data = await res.json();
        setEstadisticas(data);
      } catch (err) {
        console.error('Error al obtener estadísticas del jugador:', err);
        setEstadisticas(null);
      } finally {
        setLoading(false);
      }
    }

    cargarEstadisticas();
  }, [jugador?._id, token]);

  if (!jugador) return null;

  const nombreCompleto = `${jugador.nombre || ''} ${jugador.apellido || ''}`.trim();

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Header con información básica */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {jugador.foto ? (
                <img
                  src={jugador.foto}
                  alt={nombreCompleto || 'Jugador'}
                  className="w-20 h-20 rounded-full object-cover border border-white shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                    {nombreCompleto[0] || '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {nombreCompleto}
              </h2>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                {jugador.alias && (
                  <Badge variant="outline">Alias: {jugador.alias}</Badge>
                )}
                {jugador.genero && (
                  <Badge variant="outline">{jugador.genero}</Badge>
                )}
                {jugador.fechaNacimiento && (
                  <span>
                    Nacido: {new Date(jugador.fechaNacimiento).toLocaleDateString()}
                  </span>
                )}
                {jugador.nacionalidad && (
                  <span>{jugador.nacionalidad}</span>
                )}
              </div>

              {jugador.equipo?.nombre && (
                <p className="text-blue-600 dark:text-blue-400 font-medium mt-2">
                  Equipo: {jugador.equipo.nombre}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Estadísticas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JugadorStats
            stats={estadisticas}
            title="Estadísticas Generales"
          />

          {/* Información adicional */}
          <Card title="Información Adicional">
            <div className="space-y-3">
              {jugador.fechaNacimiento && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de nacimiento:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(jugador.fechaNacimiento).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {jugador.nacionalidad && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Nacionalidad:</span>
                  <p className="text-gray-600 dark:text-gray-400">{jugador.nacionalidad}</p>
                </div>
              )}

              {jugador.altura && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Altura:</span>
                  <p className="text-gray-600 dark:text-gray-400">{jugador.altura} cm</p>
                </div>
              )}

              {jugador.peso && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Peso:</span>
                  <p className="text-gray-600 dark:text-gray-400">{jugador.peso} kg</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Historial de equipos (si aplica) */}
        <Card title="Equipos del Jugador">
          {loadingRelaciones ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-3">Cargando equipos…</p>
          ) : relaciones && relaciones.length > 0 ? (
            <div className="space-y-2">
              {relaciones.map((rel) => {
                const equipoObj = rel.equipo || rel.equipoId || rel.equipo;
                const nombreEquipo = normalizeEquipoNombre(equipoObj, equipoObj?.nombre, 'Equipo');
                const escudo = equipoObj?.escudo;
                return (
                  <div key={rel._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {escudo ? (
                        <img src={escudo} alt={nombreEquipo} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{nombreEquipo}</p>
                        {(rel.fechaInicio || rel.fechaFin) && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {rel.fechaInicio ? new Date(rel.fechaInicio).toLocaleDateString() : ''}
                            {rel.fechaFin ? ` - ${new Date(rel.fechaFin).toLocaleDateString()}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{rel.rol || 'Jugador'}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-3">Sin equipos asociados</p>
          )}
        </Card>
      </div>
    </ModalLayout>
  );
}

export default ModalJugador;
