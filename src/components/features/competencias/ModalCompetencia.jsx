// src/components/features/competencias/ModalCompetencia.jsx
import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import CompetenciaCard from './components/CompetenciaCard';
import TablaPosiciones from './components/TablaPosiciones';
import { Card, Badge, Button } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { formatDate } from '../../../utils';

function ModalCompetencia({ competencia: competenciaProp, onClose }) {
  const [competencia, setCompetencia] = useState(competenciaProp);
  const [posiciones, setPosiciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    setCompetencia(competenciaProp);
  }, [competenciaProp]);

  useEffect(() => {
    async function cargarPosiciones() {
      if (!competencia?._id || !token) return;

      try {
        setLoading(true);
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competencia._id}/posiciones`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener posiciones de la competencia');
        const data = await res.json();
        setPosiciones(data);
      } catch (err) {
        console.error('Error al obtener posiciones de la competencia:', err);
        setPosiciones([]);
      } finally {
        setLoading(false);
      }
    }

    cargarPosiciones();
  }, [competencia?._id, token]);

  if (!competencia) return null;

  const {
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    estado,
    tipo,
    equipos = [],
    fases = [],
    reglas
  } = competencia;

  const fechaInicioFormateada = formatDate(fechaInicio);
  const fechaFinFormateada = formatDate(fechaFin);

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-6xl">
      <div className="space-y-6">
        {/* Header con información básica */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant={
                estado === 'activa' ? 'success' :
                estado === 'finalizada' ? 'primary' :
                estado === 'cancelada' ? 'danger' : 'secondary'
              }
              size="lg"
            >
              {estado === 'activa' ? 'Activa' :
               estado === 'finalizada' ? 'Finalizada' :
               estado === 'cancelada' ? 'Cancelada' : 'Programada'}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {fechaInicioFormateada} - {fechaFinFormateada}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {nombre}
            </h2>

            {descripcion && (
              <p className="text-gray-700 dark:text-gray-300">
                {descripcion}
              </p>
            )}

            <div className="flex items-center space-x-4">
              {tipo && (
                <Badge variant="outline">
                  {tipo}
                </Badge>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {equipos.length} equipos • {fases.length} fases
              </span>
            </div>
          </div>
        </Card>

        {/* Información de fases */}
        {fases && fases.length > 0 && (
          <Card title={`Fases de la Competencia (${fases.length})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fases.map((fase, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {fase.nombre || `Fase ${index + 1}`}
                    </h4>
                    <Badge variant="outline" size="sm">
                      {fase.tipo || 'Regular'}
                    </Badge>
                  </div>

                  {fase.fechaInicio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Inicio: {formatDate(fase.fechaInicio)}
                    </p>
                  )}

                  {fase.equipos && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      {fase.equipos.length} equipos participantes
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tabla de posiciones */}
        <TablaPosiciones
          posiciones={posiciones}
          title="Tabla de Posiciones"
        />

        {/* Reglas de la competencia */}
        {reglas && (
          <Card title="Reglas de la Competencia">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{ __html: reglas }}
                className="text-gray-700 dark:text-gray-300"
              />
            </div>
          </Card>
        )}

        {/* Información adicional */}
        <Card title="Información Adicional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de inicio:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(fechaInicio).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {fechaFin && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de finalización:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(fechaFin).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Estado:</span>
                <p className="text-gray-600 dark:text-gray-400 capitalize">
                  {estado?.replace('_', ' ') || 'Desconocido'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
                <p className="text-gray-600 dark:text-gray-400">{tipo || 'No especificado'}</p>
              </div>

              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Equipos participantes:</span>
                <p className="text-gray-600 dark:text-gray-400">{equipos.length}</p>
              </div>

              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Fases:</span>
                <p className="text-gray-600 dark:text-gray-400">{fases.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ModalLayout>
  );
}

export default ModalCompetencia;
