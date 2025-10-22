import React, { useEffect, useState } from 'react';

export default function SolicitudesContratoEquipoCompetencia({ equipoId, competenciaId, token, usuarioId }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const esDesdeEquipo = !!equipoId;
  const apiBase = 'https://overtime-ddyl.onrender.com/api';

  // --- Cargar solicitudes que el usuario puede ver (filtradas en backend)
    useEffect(() => {
        if (!token) return;
        setLoading(true);

    // Construir URL con query param si hay equipoId o competenciaId
    const query = equipoId
        ? `?equipo=${equipoId}`
        : competenciaId
        ? `?competencia=${competenciaId}`
        : '';

    fetch(`${apiBase}/equipos-competencia/solicitudes${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
        .then(res => res.json())
        .then(data => {
        if (Array.isArray(data)) {
            setSolicitudes(data);
        } else {
            setError('La respuesta del servidor no es una lista válida');
            setSolicitudes([]);
        }
        })
        .catch(() => setError('Error cargando solicitudes'))
        .finally(() => setLoading(false));
    }, [token, equipoId, competenciaId]);

  // --- Cargar opciones para nueva solicitud (competencias si es equipo, equipos si es competencia)
  useEffect(() => {
    if (!token) return;

    const url = esDesdeEquipo ? `${apiBase}/competencias` : `${apiBase}/equipos`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOpciones(data);
        } else {
          setError('La respuesta del servidor no es una lista válida');
          setOpciones([]);
        }
      })
      .catch(err => {
        console.error('Error cargando opciones:', err);
        setError('Error cargando opciones');
        setOpciones([]);
      });
  }, [token, esDesdeEquipo]);

  // --- Crear nueva solicitud
  const crearSolicitud = async () => {
    if (!seleccionado) return;

    try {
      setLoading(true);
      setError(null);

      const payload = esDesdeEquipo
        ? { equipo: equipoId, competencia: seleccionado }
        : { equipo: seleccionado, competencia: competenciaId };

      const res = await fetch(`${apiBase}/equipos-competencia/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error creando solicitud');
      }

      setMensaje('Solicitud creada correctamente');
      setSeleccionado('');
      setTimeout(() => setMensaje(null), 3000);

      // Recargar solicitudes
      const query = equipoId ? `?equipo=${equipoId}` : `?competencia=${competenciaId}`;
      const res2 = await fetch(`${apiBase}/equipos-competencia/solicitudes${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res2.json();
      setSolicitudes(Array.isArray(data) ? data : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Responder a solicitud
  const responderSolicitud = async (solicitudId, accion) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/equipos-competencia/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accion }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error procesando solicitud');
      }

      setMensaje(`Solicitud ${accion} correctamente`);
      setTimeout(() => setMensaje(null), 3000);

      // Recargar solicitudes
      const query = equipoId ? `?equipo=${equipoId}` : `?competencia=${competenciaId}`;
      const res2 = await fetch(`${apiBase}/equipos-competencia/solicitudes${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res2.json();
      setSolicitudes(Array.isArray(data) ? data : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Eliminar solicitud
  const eliminarSolicitud = async (solicitudId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta solicitud?')) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/equipos-competencia/solicitudes/${solicitudId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error eliminando solicitud');
      }

      setMensaje('Solicitud eliminada correctamente');
      setTimeout(() => setMensaje(null), 3000);

      // Recargar solicitudes
      const query = equipoId ? `?equipo=${equipoId}` : `?competencia=${competenciaId}`;
      const res2 = await fetch(`${apiBase}/equipos-competencia/solicitudes${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res2.json();
      setSolicitudes(Array.isArray(data) ? data : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizar lista de solicitudes
  const renderListaSolicitudes = () => {
    if (solicitudes.length === 0) {
      return <p className="text-gray-600">No hay solicitudes pendientes.</p>;
    }

    return (
      <div className="space-y-2">
        {solicitudes.map(solicitud => (
          <div key={solicitud._id} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {esDesdeEquipo
                    ? `Solicitud de ${solicitud.competencia?.nombre || 'Competencia'}`
                    : `Solicitud de ${solicitud.equipo?.nombre || 'Equipo'}`
                  }
                </p>
                <p className="text-sm text-gray-600">
                  Estado: <span className="capitalize font-medium">{solicitud.estado}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Creada: {new Date(solicitud.fechaCreacion).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                {solicitud.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => responderSolicitud(solicitud._id, 'aceptar')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      disabled={loading}
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => responderSolicitud(solicitud._id, 'rechazar')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      disabled={loading}
                    >
                      Rechazar
                    </button>
                  </>
                )}
                <button
                  onClick={() => eliminarSolicitud(solicitud._id)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  disabled={loading}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --- Renderizar formulario de nueva solicitud
  const renderFormularioNueva = () => {
    if (solicitudes.length === 0) return null;

    return (
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Crear nueva solicitud</h4>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {esDesdeEquipo ? 'Seleccionar competencia:' : 'Seleccionar equipo:'}
          </label>
          <select
            value={seleccionado}
            onChange={e => setSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            {opciones.map(opcion => (
              <option key={opcion._id} value={opcion._id}>
                {opcion.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={crearSolicitud}
          disabled={!seleccionado || loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Procesando...' : 'Crear solicitud'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Solicitudes Equipo-Competencia</h3>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {mensaje}
        </div>
      )}

      {renderFormularioNueva()}
      {renderListaSolicitudes()}
    </div>
  );
}
