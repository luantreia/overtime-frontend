import React, { useEffect, useState } from 'react';

export default function SolicitudesContrato({ jugadorId, equipoId, token }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const esDesdeJugador = !!jugadorId;

  // Cargar solicitudes pendientes
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo/pendientes?${jugadorId ? `jugador=${jugadorId}` : `equipo=${equipoId}`}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSolicitudes(data))
      .catch(() => setError('Error cargando solicitudes'))
      .finally(() => setLoading(false));
  }, [jugadorId, equipoId, token]);

  // Cargar opciones para nueva solicitud
  useEffect(() => {
    if (!token) return;

    const url = esDesdeJugador
      ? 'https://overtime-ddyl.onrender.com/api/equipos'
      : 'https://overtime-ddyl.onrender.com/api/jugadores';

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setOpciones(data))
      .catch(() => setOpciones([]));
  }, [jugadorId, equipoId, token]);

  // Enviar nueva solicitud
  async function enviarSolicitud() {
    if (!seleccionado) return;

    const url = esDesdeJugador
      ? 'https://overtime-ddyl.onrender.com/api/jugador-equipo/solicitar-jugador'
      : 'https://overtime-ddyl.onrender.com/api/jugador-equipo/solicitar-equipo';

    const body = {
      jugador: jugadorId || seleccionado,
      equipo: equipoId || seleccionado,
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
  }

  // Aceptar / rechazar solicitud
  async function actualizarSolicitud(id, nuevoEstado) {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error actualizando solicitud');
      setSolicitudes(prev => prev.filter(s => s._id !== id));
    } catch {
      alert('Error al actualizar la solicitud');
    }
  }

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Solicitudes de contrato pendientes</h3>
      {loading && <p>Cargando solicitudes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && solicitudes.length === 0 && <p>No hay solicitudes pendientes.</p>}

      <ul className="space-y-2 max-h-48 overflow-auto mb-4">
        {solicitudes.map(s => (
          <li key={s._id} className="border p-2 rounded">
            <p>
              <strong>Jugador:</strong> {s.jugador?.nombre || '-'} | <strong>Equipo:</strong> {s.equipo?.nombre || '-'}
            </p>
            <p><strong>Estado:</strong> {s.estado}</p>
            <div className="flex gap-2 mt-1">
              <button className="btn-primary btn-sm" onClick={() => actualizarSolicitud(s._id, 'aceptado')}>Aceptar</button>
              <button className="btn-danger btn-sm" onClick={() => actualizarSolicitud(s._id, 'rechazado')}>Rechazar</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Nueva solicitud */}
      <h4 className="text-lg font-semibold mb-1">
        {esDesdeJugador ? 'Solicitar a un equipo' : 'Invitar a un jugador'}
      </h4>
      <div className="flex gap-2">
        <select
          className="input flex-grow"
          value={seleccionado}
          onChange={e => setSeleccionado(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {opciones.map(o => (
            <option key={o._id} value={o._id}>
              {o.nombre || o.alias || o.email}
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
