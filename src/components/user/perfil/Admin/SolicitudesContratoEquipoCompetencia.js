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
      .then(data => setOpciones(data))
      .catch(() => setOpciones([]));
  }, [esDesdeEquipo, token]);

  // --- Enviar nueva solicitud
  const enviarSolicitud = async () => {
    if (!seleccionado) return;

    const url = esDesdeEquipo
      ? `${apiBase}/equipos-competencia/solicitar-equipo`
      : `${apiBase}/equipos-competencia/solicitar-competencia`;

    const body = {
      equipo: equipoId || seleccionado,
      competencia: competenciaId || seleccionado,
    };

    try {
      setMensaje(null);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al enviar solicitud');

      setMensaje('Solicitud enviada con éxito');
      setSeleccionado('');
      setSolicitudes(prev => [...prev, data]);
    } catch (e) {
      setMensaje(`Error: ${e.message}`);
    }
  };

  // --- Actualizar estado de la solicitud (aceptar, rechazar, cancelar)
  const actualizarSolicitud = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${apiBase}/equipos-competencia/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error('Error actualizando solicitud');
      setSolicitudes(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      alert(`Error al actualizar solicitud: ${e.message}`);
    }
  };

  // --- Función para saber si el usuario es admin de una entidad (jugador o equipo)
  const esAdmin = (entidad) =>
    entidad?.creadoPor === usuarioId || (entidad?.administradores || []).includes(usuarioId);

  // --- Permiso para gestionar solicitud (aceptar/rechazar) según origen
  const puedeGestionarSolicitud = (s) => {
    if (s.origen === 'equipo') return esAdmin(s.competencia);
    if (s.origen === 'competencia') return esAdmin(s.equipo);
    return false;
  };

  // --- Permiso para cancelar solicitud (solo el emisor)
  const puedeCancelarSolicitud = (s) => {
    if (s.origen === 'equipo') return esAdmin(s.equipo);
    if (s.origen === 'competencia') return esAdmin(s.competencia);
    return false;
  };

  // --- Badge para mostrar origen de solicitud
  const etiquetaOrigen = (s) => {
    if (s.origen === 'equipo') return 'Equipo solicitó';
    if (s.origen === 'competencia') return 'Competencia invitó';
    return 'Origen desconocido';
  };

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Solicitudes de equipo y competencia</h3>

      {loading && <p>Cargando solicitudes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && solicitudes.length === 0 && <p>No hay solicitudes pendientes.</p>}

      <ul className="space-y-2 max-h-60 overflow-auto mb-4">
        {solicitudes.map((s) => {
          const puedeGestionar = puedeGestionarSolicitud(s);
          const puedeCancelar = puedeCancelarSolicitud(s);
          const origen = etiquetaOrigen(s);

          return (
            <li key={s._id} className="border p-2 rounded bg-white shadow-sm">
              <p>
                <strong>Equipo:</strong> {s.equipo?.nombre || '-'} |{' '}
                <strong>Competencia:</strong> {s.competencia?.nombre || '-'}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">
                  <strong>Estado:</strong> {s.estado}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {origen}
                </span>
              </div>

              <div className="flex gap-2 mt-2">
                {puedeGestionar && (
                  <>
                    <button className="btn-primary btn-sm" onClick={() => actualizarSolicitud(s._id, 'aceptado')}>
                      Aceptar
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => actualizarSolicitud(s._id, 'rechazado')}>
                      Rechazar
                    </button>
                  </>
                )}
                {puedeCancelar && (
                  <button className="btn-warning btn-sm" onClick={() => actualizarSolicitud(s._id, 'cancelado')}>
                    Cancelar
                  </button>
                )}
                {!puedeGestionar && !puedeCancelar && (
                  <p className="text-gray-500 text-sm italic">Esperando respuesta...</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <h4 className="text-lg font-semibold mb-1">
        {esDesdeEquipo ? 'Solicitar a una competencia' : 'Invitar a un equipo'}
      </h4>
      <div className="flex gap-2">
        <select
          className="input flex-grow"
          value={seleccionado}
          onChange={(e) => setSeleccionado(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {opciones.map((o) => (
            <option key={o._id} value={o._id}>
              {o.nombre}
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={enviarSolicitud} disabled={!seleccionado}>
          Enviar
        </button>
      </div>

      {mensaje && <p className="text-sm text-gray-600 mt-1">{mensaje}</p>}
    </section>
  );
}
