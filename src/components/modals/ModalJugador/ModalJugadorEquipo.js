import React, { useState, useEffect } from 'react';
import CloseButton from '../../common/FormComponents/CloseButton';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

export default function ModalJugadorEquipo({ relacion: relacionProp, onClose, onJugadorActualizado, actualizarRelacion, error }) {
  const [relacion, setRelacion] = useState(relacionProp);
  const [form, setForm] = useState({
    desde: '',
    hasta: '',
    activo: true,
    estado: 'aceptado',
    foto: '',
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRelacion(relacionProp);
    if (relacionProp) {
      setForm({
        desde: relacionProp.desde ? new Date(relacionProp.desde).toISOString().slice(0, 10) : '',
        hasta: relacionProp.hasta ? new Date(relacionProp.hasta).toISOString().slice(0, 10) : '',
        activo: relacionProp.activo ?? true,
        estado: relacionProp.estado || 'aceptado',
        foto: relacionProp.foto || '',
      });
    }
  }, [relacionProp]);

  if (!relacion || !relacion.jugador || !relacion.equipo) return null;

  const jugador = relacion.jugador;
  const equipo = relacion.equipo;
  const escudo = equipo?.escudo;
  const imagen = relacion.foto || jugador.foto;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const datosActualizar = {
        desde: form.desde || undefined,
        hasta: form.hasta || undefined,
        activo: form.activo,
        estado: form.estado,
        foto: form.foto || undefined,
      };

      const actualizada = await actualizarRelacion(relacion._id, datosActualizar);
      setRelacion(actualizada);
      setEditando(false);
      if (onJugadorActualizado) onJugadorActualizado(actualizada);
    } catch (err) {
      console.error('Error al actualizar vínculo:', err);
      alert(`Error al actualizar el vínculo: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[1100] flex justify-center items-center p-2.5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose} />

        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-4">
          {escudo && (
            <img src={escudo} alt="Escudo equipo" className="w-12 h-12 object-contain" />
          )}
          <div>
            <h2 className="text-xl font-bold">{jugador.nombre}</h2>
            {jugador.edad && (
              <p className="text-sm text-gray-600">{jugador.edad} años</p>
            )}
          </div>
        </div>

        {/* Imagen */}
        {imagen && (
          <div className="mb-4">
            <img
              src={imagen}
              alt={`Foto de ${jugador.nombre}`}
              className="w-full h-60 object-cover rounded-lg"
            />
          </div>
        )}

        {!editando ? (
          <>
            {/* Mostrar datos */}
            <div className="space-y-2 text-sm text-gray-700">
              {jugador.nacionalidad && (
                <p><span className="font-semibold">Nacionalidad:</span> {jugador.nacionalidad}</p>
              )}
              {relacion.desde && (
                <p><span className="font-semibold">Desde:</span> {new Date(relacion.desde).toLocaleDateString()}</p>
              )}
              {relacion.hasta && (
                <p><span className="font-semibold">Hasta:</span> {new Date(relacion.hasta).toLocaleDateString()}</p>
              )}
              <p><span className="font-semibold">Activo:</span> {relacion.activo ? 'Sí' : 'No'}</p>
            </div>

            {/* Botón editar */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="btn-secundario"
                onClick={() => setEditando(true)}
              >
                Editar vínculo
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Formulario de edición */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Desde</span>
                <input
                  type="date"
                  name="desde"
                  value={form.desde}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Hasta</span>
                <input
                  type="date"
                  name="hasta"
                  value={form.hasta}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Foto (URL)</span>
                <input
                  type="text"
                  name="foto"
                  value={form.foto}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-2 py-1"
                  placeholder="URL de la foto"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Estado</span>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-2 py-1"
                >
                  <option value="aceptado">Aceptado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                />
                <span>Activo</span>
              </label>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setEditando(false)}
                  className="btn-secundario"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  className="btn-primario"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error.message}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
