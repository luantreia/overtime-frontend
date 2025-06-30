import React, { useState } from 'react';
import EditorEquiposFase from './EditorEquiposFase';

export default function ModalFase({ faseInicial = {}, fasesDisponibles = [], onGuardar, onClose }) {
  const [fase, setFase] = useState({
    nombre: '',
    tipo: 'liga',
    orden: 0,
    descripcion: '',
    numeroClasificados: '',
    division: '',
    numeroAscensos: '',
    numeroDescensos: '',
    superiorDirecta: '',
    inferiorDirecta: '',
    competencia: faseInicial.competencia || '',
    ...faseInicial,
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFase((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (fase.tipo === 'grupo' && !fase.numeroClasificados) {
      setError('Debe completar el número de clasificados para fase de grupo.');
      return;
    }

    if (fase.tipo === 'liga') {
      if (!fase.division) {
        setError('Debe seleccionar una división para fase de liga.');
        return;
      }
      if (fase.numeroAscensos === '') {
        setError('Debe indicar la cantidad de ascensos.');
        return;
      }
      if (fase.numeroDescensos === '') {
        setError('Debe indicar la cantidad de descensos.');
        return;
      }
    }
    console.log("Fase a guardar:", fase);

    onGuardar(fase);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-lg md:max-w-xl lg:max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {fase._id ? 'Editar fase' : 'Crear nueva fase'}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              value={fase.nombre}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="tipo">Tipo de fase</label>
            <select
              id="tipo"
              name="tipo"
              value={fase.tipo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="liga">Liga</option>
              <option value="grupo">Grupo</option>
              <option value="playoff">Playoff</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="orden">Orden</label>
            <input
              id="orden"
              type="number"
              name="orden"
              value={fase.orden}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={fase.descripcion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {fase.tipo === 'grupo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="numeroClasificados">
                Número de clasificados
              </label>
              <input
                id="numeroClasificados"
                type="number"
                name="numeroClasificados"
                value={fase.numeroClasificados}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          )}

          {fase.tipo === 'liga' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="division">División</label>
                <select
                  id="division"
                  name="division"
                  value={fase.division}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="A">División A</option>
                  <option value="B">División B</option>
                  <option value="C">División C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="numeroAscensos">
                  Número de ascensos
                </label>
                <input
                  id="numeroAscensos"
                  type="number"
                  name="numeroAscensos"
                  value={fase.numeroAscensos}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="numeroDescensos">
                  Número de descensos
                </label>
                <input
                  id="numeroDescensos"
                  type="number"
                  name="numeroDescensos"
                  value={fase.numeroDescensos}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="superiorDirecta">
                  Fase superior directa (opcional)
                </label>
                <select
                  id="superiorDirecta"
                  name="superiorDirecta"
                  value={fase.superiorDirecta || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Ninguna</option>
                  {fasesDisponibles.map((f) => (
                    <option key={f._id} value={f._id}>{f.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="inferiorDirecta">
                  Fase inferior directa (opcional)
                </label>
                <select
                  id="inferiorDirecta"
                  name="inferiorDirecta"
                  value={fase.inferiorDirecta || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Ninguna</option>
                  {fasesDisponibles.map((f) => (
                    <option key={f._id} value={f._id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Guardar
            </button>
          </div>
        </form>

        {(fase.tipo === 'liga' || fase.tipo === 'grupo') && fase.competencia && (
          <div className="mt-6">
            <EditorEquiposFase
              competenciaId={fase.competencia}
              tipoFase={fase.tipo}
            />
          </div>
        )}
      </div>
    </div>
  );

}
