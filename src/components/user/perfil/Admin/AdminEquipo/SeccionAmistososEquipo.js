import React, { useState, useEffect } from 'react';
import useEquipos from '../../../../../hooks/useEquipos';
import { usePartidos } from '../../../../../hooks/usePartidos';
import ModalPartidoAdmin from '../AdminPartido/ModalPartidoAdmin';




export default function SeccionAmistososEquipo({ equipoId, token }) {
  const [amistosos, setAmistosos] = useState([]);
  const [fecha, setFecha] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [equipoVisitante, setEquipoVisitante] = useState('');
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);

  const { equipos: equiposGlobales, loading: loadingEquipos } = useEquipos(token);
  const { crearNuevoPartido } = usePartidos(token);

  const cargarAmistosos = async () => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/partidos?tipo=amistoso&equipo=${equipoId}`, {
        headers: { Authorization: `Bearer ${token}` },
        });
      const data = await res.json();
      // Filtrar solo partidos amistosos (competencia debe ser null)
      const amistososFiltrados = data.filter(partido => partido.competencia === null);
      setAmistosos(amistososFiltrados);
    } catch (err) {
      console.error('Error al cargar amistosos:', err);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!fecha || !modalidad || !categoria || !equipoVisitante) return alert('Completa todos los campos');
    if (equipoVisitante === equipoId) return alert('No puede ser el mismo equipo');

    const fechaPartido = new Date(fecha);
    const hoy = new Date();
    const estado = fechaPartido < hoy ? 'finalizado' : 'programado';
    
    const nuevoPartido = {
      competencia: null,
      fase: null,
      modalidad,
      categoria,
      fecha: fechaPartido.toISOString(),
      equipoLocal: equipoId,
      equipoVisitante,
      estado,
    };
    
    await crearNuevoPartido(nuevoPartido, (creado) => {
      if (creado) {
        setFecha('');
        setModalidad('');
        setCategoria('');
        setEquipoVisitante('');
        cargarAmistosos();
      }
    });
  };

  useEffect(() => {
    if (equipoId && token) {
      cargarAmistosos();
    }
  }, [equipoId, token]);

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800">Partidos Amistosos</h4>

      {/* Crear nuevo amistoso */}
      <form onSubmit={handleCrear} className="bg-gray-100 p-4 rounded-md space-y-4">
        <h5 className="font-medium text-gray-700">Nuevo Amistoso</h5>

        {/* Modalidad */}
        <div className="block text-gray-700">
          <span>Modalidad:</span>
          <div className="mt-1 flex gap-6">
            {['Foam', 'Cloth'].map((mod) => (
              <label key={mod} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="modalidad"
                  value={mod}
                  checked={modalidad === mod}
                  onChange={e => setModalidad(e.target.value)}
                  className="form-radio text-blue-600"
                  required
                />
                <span className="ml-2">{mod}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categoría */}
        <div className="block text-gray-700">
          <span>Categoría:</span>
          <div className="mt-1 flex gap-6">
            {['Masculino', 'Femenino', 'Mixto', 'Libre'].map((cat) => (
              <label key={cat} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="categoria"
                  value={cat}
                  checked={categoria === cat}
                  onChange={e => setCategoria(e.target.value)}
                  className="form-radio text-green-600"
                  required
                />
                <span className="ml-2">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          required
        />

        {/* Rival */}
        <select
          value={equipoVisitante}
          onChange={e => setEquipoVisitante(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Seleccionar equipo rival</option>
          {equiposGlobales
            .filter(eq => eq._id !== equipoId)
            .map(eq => (
              <option key={eq._id} value={eq._id}>
                {eq.nombre}
              </option>
            ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Crear Amistoso
        </button>
      </form>

      {/* Lista de amistosos */}
      <div className="border-t pt-4">
        {amistosos.length === 0 ? (
          <p className="text-gray-600">No hay partidos amistosos registrados.</p>
        ) : (
        <ul className="divide-y">
          {amistosos.map(partido => (
            <li key={partido._id}>
              <button
                onClick={() => setPartidoSeleccionado(partido)}
                className="w-full text-left py-2 hover:bg-gray-100 rounded px-2 transition"
              >
                <div className="flex justify-between items-center text-sm">
                  <span>
                    {partido.equipoLocal?.nombre || 'Local'} vs {partido.equipoVisitante?.nombre || 'Visitante'}
                  </span>
                  <span className="text-gray-500">
                    {new Date(partido.fecha).toLocaleDateString()} · {partido.modalidad} · {partido.categoria}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>

        )}
      </div>
    {partidoSeleccionado && (
      <ModalPartidoAdmin
        partidoId={partidoSeleccionado._id}
        token={token}
        onClose={() => setPartidoSeleccionado(null)}
      />
    )}
    </div>
    
  );
}
