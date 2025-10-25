import React, { useState } from 'react';

export default function SeccionDatosEquipoCompetencia({ equipoCompetencia, token, onEliminado, onActualizado }) {
  const [estado, setEstado] = useState(equipoCompetencia?.estado || '');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  if (!equipoCompetencia) return null;

  const { _id, equipo, fechaInicio, fechaFin, observaciones } = equipoCompetencia;

  const handleActualizarEstado = async (nuevoEstado) => {
    setCargando(true);
    setError(null);
    try {
      const payload = { estado: nuevoEstado };
      if (motivoRechazo && (nuevoEstado === 'rechazado' || nuevoEstado === 'cancelado')) {
        payload.motivoRechazo = motivoRechazo;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipos-competencia/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Error al actualizar');

      const data = await res.json();

      if (nuevoEstado === 'rechazado' || nuevoEstado === 'cancelado') {
        onEliminado?.(); // ya fue eliminado en el backend
      } else {
        setEstado(data.estado);
        onActualizado?.(data);
      }
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async () => {
    const confirmar = window.confirm('¿Estás seguro de eliminar esta relación?');
    if (!confirmar) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipos-competencia/${_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Error al eliminar');

      onEliminado?.();
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const estadoColor = {
    aceptado: 'bg-green-100 text-green-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
    rechazado: 'bg-red-100 text-red-800',
    cancelado: 'bg-gray-200 text-gray-700',
    finalizado: 'bg-gray-300 text-gray-900',
  };

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Datos del Equipo en la Competencia</h3>

      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
        <div><span className="font-semibold">Equipo:</span> {equipo?.nombre || '—'}</div>

        <div>
          <span className="font-semibold">Estado:</span>{' '}
          <span className={`inline-block px-2 py-1 rounded text-sm ${estadoColor[estado] || 'bg-gray-100 text-gray-800'}`}>
            {estado}
          </span>
        </div>

        <div><span className="font-semibold">Desde:</span> {fechaInicio ? new Date(fechaInicio).toLocaleDateString() : '—'}</div>
        <div><span className="font-semibold">Hasta:</span> {fechaFin ? new Date(fechaFin).toLocaleDateString() : '—'}</div>

        {observaciones && (
          <div>
            <span className="font-semibold">Observaciones:</span> {observaciones}
          </div>
        )}

        {/* Acciones */}
        <div className="pt-4 space-y-2">
          {estado === 'pendiente' && (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleActualizarEstado('aceptado')}
                  disabled={cargando}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => handleActualizarEstado('rechazado')}
                  disabled={cargando}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Rechazar
                </button>
              </div>

              <input
                type="text"
                placeholder="Motivo del rechazo"
                className="w-full border px-3 py-1 rounded mt-2"
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </>
          )}

          {estado !== 'aceptado' && (
            <button
              onClick={handleEliminar}
              disabled={cargando}
              className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Eliminar
            </button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    </section>
  );
}
