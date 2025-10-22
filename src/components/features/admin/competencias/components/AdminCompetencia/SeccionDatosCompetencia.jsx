import React, { useState } from 'react';

export default function SeccionDatosCompetencia({ competencia, token, onUpdate }) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datos, setDatos] = useState({
    nombre: competencia.nombre || '',
    descripcion: competencia.descripcion || '',
    estado: competencia.estado || 'activa',
    fechaInicio: competencia.fechaInicio ? competencia.fechaInicio.split('T')[0] : '',
    fechaFin: competencia.fechaFin ? competencia.fechaFin.split('T')[0] : '',
  });

  const guardarCambios = async () => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competencia._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      if (!res.ok) throw new Error('Error al actualizar competencia');

      setModoEdicion(false);
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar cambios');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Datos de la Competencia</h4>
        <button
          onClick={() => setModoEdicion(!modoEdicion)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {modoEdicion ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {modoEdicion ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={datos.nombre}
              onChange={(e) => setDatos({...datos, nombre: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={datos.estado}
              onChange={(e) => setDatos({...datos, estado: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={datos.fechaInicio}
              onChange={(e) => setDatos({...datos, fechaInicio: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <input
              type="date"
              value={datos.fechaFin}
              onChange={(e) => setDatos({...datos, fechaFin: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={datos.descripcion}
              onChange={(e) => setDatos({...datos, descripcion: e.target.value})}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={guardarCambios}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setModoEdicion(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Nombre:</span> {competencia.nombre}
          </div>
          <div>
            <span className="font-medium">Estado:</span> {competencia.estado}
          </div>
          <div>
            <span className="font-medium">Fecha Inicio:</span> {competencia.fechaInicio ? new Date(competencia.fechaInicio).toLocaleDateString() : 'No definida'}
          </div>
          <div>
            <span className="font-medium">Fecha Fin:</span> {competencia.fechaFin ? new Date(competencia.fechaFin).toLocaleDateString() : 'No definida'}
          </div>
          <div className="md:col-span-2">
            <span className="font-medium">Descripción:</span> {competencia.descripcion || 'Sin descripción'}
          </div>
        </div>
      )}
    </div>
  );
}
