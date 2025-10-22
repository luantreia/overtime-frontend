// src/components/features/admin/solicitudes/SolicitudesContrato.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Select, Spinner } from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { formatDate } from '../../../../utils/formatters';

/**
 * Componente mejorado para gestión de solicitudes de contrato
 */
const SolicitudesContrato = ({
  jugadorId,
  equipoId,
  usuarioId,
  className = ''
}) => {
  const { user } = useAuth();
  const { get, post, put, del, loading } = useApi();
  const [solicitudes, setSolicitudes] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const esDesdeJugador = !!jugadorId;
  const titulo = esDesdeJugador ? 'Solicitudes de Contrato' : 'Gestión de Contratos';

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, [jugadorId, equipoId]);

  const cargarDatosIniciales = async () => {
    if (!user?.getIdToken) return;

    try {
      const token = await user.getIdToken();

      // Cargar solicitudes existentes
      const query = equipoId
        ? `?equipo=${equipoId}`
        : jugadorId
        ? `?jugador=${jugadorId}`
        : '';

      const solicitudesData = await get(`/api/jugador-equipo/solicitudes${query}`);
      setSolicitudes(solicitudesData || []);

      // Cargar opciones disponibles
      const opcionesData = await get(`/api/jugador-equipo/opciones${query}`);
      setOpciones(opcionesData || []);

    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const enviarSolicitud = async () => {
    if (!seleccionado) return;

    try {
      setMensaje('Enviando solicitud...');

      const datosSolicitud = {
        ...(esDesdeJugador ? { equipo: seleccionado } : { jugador: seleccionado }),
        tipo: esDesdeJugador ? 'solicitud_jugador' : 'invitacion_equipo'
      };

      await post('/api/jugador-equipo/solicitudes', datosSolicitud);

      setMensaje('Solicitud enviada exitosamente');
      setSeleccionado('');
      await cargarDatosIniciales();

      setTimeout(() => setMensaje(null), 3000);

    } catch (err) {
      setMensaje(`Error: ${err.message}`);
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  const gestionarSolicitud = async (solicitudId, accion) => {
    try {
      await put(`/api/jugador-equipo/solicitudes/${solicitudId}`, { accion });
      await cargarDatosIniciales();
    } catch (err) {
      console.error('Error gestionando solicitud:', err);
    }
  };

  const puedeGestionar = (solicitud) => {
    // Lógica para determinar si el usuario puede gestionar esta solicitud
    return esDesdeJugador
      ? solicitud.jugador?._id === jugadorId
      : solicitud.equipo?._id === equipoId;
  };

  const puedeCancelar = (solicitud) => {
    // Lógica para determinar si se puede cancelar
    return solicitud.estado === 'pendiente' && puedeGestionar(solicitud);
  };

  return (
    <Card title={titulo} className={className}>
      <div className="space-y-6">
        {/* Lista de solicitudes existentes */}
        <div>
          <h4 className="text-lg font-semibold mb-4">
            Solicitudes Existentes ({solicitudes.length})
          </h4>

          {loading ? (
            <Spinner message="Cargando solicitudes..." />
          ) : solicitudes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No hay solicitudes pendientes
            </p>
          ) : (
            <div className="space-y-3">
              {solicitudes.map((solicitud) => (
                <Card key={solicitud._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium">
                          {esDesdeJugador
                            ? `Solicitud a ${solicitud.equipo?.nombre || 'Equipo'}`
                            : `Invitación de ${solicitud.jugador?.nombre || 'Jugador'}`}
                        </span>
                        <Badge
                          variant={
                            solicitud.estado === 'aceptada' ? 'success' :
                            solicitud.estado === 'rechazada' ? 'danger' :
                            solicitud.estado === 'cancelada' ? 'warning' : 'primary'
                          }
                        >
                          {solicitud.estado}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Creada: {formatDate(solicitud.fechaCreacion)}</p>
                        {solicitud.fechaRespuesta && (
                          <p>Respondida: {formatDate(solicitud.fechaRespuesta)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {puedeGestionar(solicitud) && (
                        <>
                          {solicitud.estado === 'pendiente' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => gestionarSolicitud(solicitud._id, 'aceptar')}
                              >
                                Aceptar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => gestionarSolicitud(solicitud._id, 'rechazar')}
                              >
                                Rechazar
                              </Button>
                            </>
                          )}

                          {puedeCancelar(solicitud) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => gestionarSolicitud(solicitud._id, 'cancelar')}
                            >
                              Cancelar
                            </Button>
                          )}
                        </>
                      )}

                      {!puedeGestionar(solicitud) && (
                        <p className="text-gray-500 text-sm italic">Esperando respuesta...</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Formulario para nuevas solicitudes */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold mb-4">
            {esDesdeJugador ? 'Solicitar a un equipo' : 'Invitar a un jugador'}
          </h4>

          <div className="flex gap-3">
            <div className="flex-1">
              <Select
                value={seleccionado}
                onChange={(e) => setSeleccionado(e.target.value)}
                placeholder="Seleccionar..."
              >
                <option value="">Seleccionar...</option>
                {opciones.map((opcion) => (
                  <option key={opcion._id} value={opcion._id}>
                    {opcion.nombre || opcion.alias || opcion.email}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="primary"
              onClick={enviarSolicitud}
              disabled={!seleccionado || loading}
              loading={loading}
            >
              Enviar Solicitud
            </Button>
          </div>

          {mensaje && (
            <p className={`mt-3 text-sm ${mensaje.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SolicitudesContrato;
