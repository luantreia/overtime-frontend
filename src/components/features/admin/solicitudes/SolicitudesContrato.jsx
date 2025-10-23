// src/components/features/admin/solicitudes/SolicitudesContrato.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  const { user, token: contextToken } = useAuth();
  const { get, post, put, del, loading } = useApi();
  const [solicitudes, setSolicitudes] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const esDesdeJugador = !!jugadorId;
  const titulo = esDesdeJugador ? 'Solicitudes de Contrato' : 'Gestión de Contratos';

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugadorId, equipoId, user, contextToken]);

  const cargarDatosIniciales = async () => {
    const fallbackToken = contextToken || (user?.getIdToken ? await user.getIdToken().catch(() => null) : null) || localStorage.getItem('token');
    if (!fallbackToken) {
      console.warn('Token no disponible aún, reintentando cuando user/contextToken cambien');
      return;
    }

    const authHeaders = { Authorization: `Bearer ${fallbackToken}` };

    // Construir query
    const query = equipoId
      ? `?equipo=${equipoId}`
      : jugadorId
      ? `?jugador=${jugadorId}`
      : '';

    // Intentar cargar ambas fuentes de forma independiente
    try {
      const relaciones = await get(`/api/jugador-equipo${query}`, { headers: authHeaders });
      const lista = Array.isArray(relaciones) ? relaciones : [];
      const pendientes = lista.filter((r) => r.estado === 'pendiente');
      const normalizadas = pendientes.map((r) => ({
        ...r,
        fechaCreacion: r.createdAt || r.fechaCreacion,
        fechaRespuesta: r.updatedAt || r.fechaRespuesta,
      }));
      setSolicitudes(normalizadas);
    } catch (err) {
      console.warn('Error cargando solicitudes, continúo con opciones:', err?.message || err);
      setSolicitudes([]);
    }

    try {
      const opcionesData = await get(`/api/jugador-equipo/opciones${query}`, { headers: authHeaders });
      setOpciones(Array.isArray(opcionesData) ? opcionesData : []);
    } catch (err) {
      console.error('Error cargando opciones:', err?.message || err);
      setOpciones([]);
    }

    setFiltro('');
    setSeleccionado('');
  };

  const opcionesFiltradas = useMemo(() => {
    if (!filtro.trim()) return opciones;
    const termino = filtro.trim().toLowerCase();
    return opciones.filter((opcion) => {
      const campos = [opcion.nombre, opcion.alias, opcion.email]
        .filter(Boolean)
        .map((valor) => valor.toLowerCase());
      return campos.some((campo) => campo.includes(termino));
    });
  }, [filtro, opciones]);

  const selectOptions = useMemo(() => (
    (opcionesFiltradas || []).map((opcion) => ({
      value: opcion._id,
      label: opcion.nombre || opcion.alias || opcion.email || 'Sin nombre'
    }))
  ), [opcionesFiltradas]);

  const enviarSolicitud = async () => {
    if (!seleccionado) return;

    try {
      setMensaje('Enviando solicitud...');

      const datosSolicitud = esDesdeJugador
        ? { jugador: jugadorId, equipo: seleccionado }
        : { jugador: seleccionado, equipo: equipoId };

      const token = await user.getIdToken();
      const endpoint = esDesdeJugador
        ? '/api/jugador-equipo/solicitar-jugador'
        : '/api/jugador-equipo/solicitar-equipo';

      await post(endpoint, datosSolicitud, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      const token = await user.getIdToken();
      const estado = accion === 'aceptar' ? 'aceptado' : accion === 'rechazar' ? 'rechazado' : 'cancelado';
      await put(`/api/jugador-equipo/${solicitudId}`, { estado }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await cargarDatosIniciales();
    } catch (err) {
      console.error('Error gestionando solicitud:', err);
    }
  };

  const soySolicitante = (solicitud) => {
    // Si estoy en vista jugador y el origen es 'jugador', yo la creé
    // Si estoy en vista equipo y el origen es 'equipo', yo la creé
    return (esDesdeJugador && solicitud.origen === 'jugador') || (!esDesdeJugador && solicitud.origen === 'equipo');
  };

  // Destinatario es el lado opuesto al origen
  const esDestinatario = (solicitud) => {
    return (esDesdeJugador && solicitud.origen === 'equipo') || (!esDesdeJugador && solicitud.origen === 'jugador');
  };

  // Aceptar/Rechazar: solo el destinatario y cuando está pendiente
  const puedeAceptarRechazar = (solicitud) => solicitud.estado === 'pendiente' && esDestinatario(solicitud);
  // Cancelar: solo el origen (quien inició) y cuando está pendiente
  const puedeCancelar = (solicitud) => solicitud.estado === 'pendiente' && soySolicitante(solicitud);

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
                            solicitud.estado === 'aceptado' ? 'success' :
                            solicitud.estado === 'rechazado' ? 'danger' :
                            solicitud.estado === 'cancelado' ? 'warning' : 'primary'
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
                      {puedeAceptarRechazar(solicitud) && (
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
                      {!puedeAceptarRechazar(solicitud) && !puedeCancelar(solicitud) && (
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                className="input flex-1"
                placeholder="Buscar por nombre, alias o email"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltro('')}
                disabled={!filtro}
              >
                Limpiar
              </Button>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Select
                  value={seleccionado}
                  onChange={(e) => setSeleccionado(e.target.value)}
                  placeholder="Seleccionar..."
                  options={selectOptions}
                />
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

            {!loading && opciones.length > 0 && opcionesFiltradas.length === 0 && (
              <p className="text-sm text-gray-500">No se encontraron opciones que coincidan con "{filtro}".</p>
            )}

            {!loading && opciones.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay opciones disponibles en este momento.
              </p>
            )}
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
