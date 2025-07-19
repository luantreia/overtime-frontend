import React, { useEffect, useState } from 'react';
import ModalBase from '../../ModalBase';

export default function ModalJugadorCompetenciaAdmin({
  abierto,
  onClose,
  jugadorCompetencia,
  token,
  usuarioId,
  onUpdate,
}) {
  const [datos, setDatos] = useState(jugadorCompetencia);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDatos(jugadorCompetencia);
    setEditando(false);
    setError(null);
  }, [jugadorCompetencia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/jugadores-competencia/${datos._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datos),
        }
      );
      if (!res.ok) throw new Error('Error al guardar cambios');
      setEditando(false);
      onUpdate?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const camposEditables = ['estado', 'alias', 'fechaInicio', 'fechaFin'];

  return (
    <ModalBase abierto={abierto} onClose={onClose} titulo="Jugador en Competencia">
      {datos && (
        <div className="space-y-4">
          <div>
            <strong>Jugador:</strong> {datos.jugador?.nombre || 'N/A'}
          </div>

          {camposEditables.map((campo) => (
            <div key={campo}>
              <label className="block font-medium capitalize">{campo}</label>
              <input
                type={campo.includes('fecha') ? 'date' : 'text'}
                name={campo}
                value={datos[campo] || ''}
                onChange={handleChange}
                disabled={!editando}
                className="border px-2 py-1 w-full rounded"
              />
            </div>
          ))}

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Editar
              </button>
            ) : (
              <>
                <button
                  onClick={guardarCambios}
                  disabled={cargando}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setDatos(jugadorCompetencia);
                    setEditando(false);
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </ModalBase>
  );
}
