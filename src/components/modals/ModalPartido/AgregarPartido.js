import React, { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';

const AgregarPartido = () => {
  const [liga, setLiga] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fecha, setFecha] = useState('');
  const [equipoLocal, setEquipoLocal] = useState('');
  const [equipoVisitante, setEquipoVisitante] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [token, setToken] = useState('');
  const [uid, setUid] = useState('');

  const modalidadOptions = [
    { value: 'Foam', label: 'Foam' },
    { value: 'Cloth', label: 'Cloth' },
  ];

  const categoriaOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Mixto', label: 'Mixto' },
    { value: 'Libre', label: 'Libre' }
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idToken = await getIdToken(user, true);
          setToken(idToken);
          setUid(user.uid);
        } catch (error) {
          console.error("Error al obtener el token:", error);
          setToken('');
          setUid('');
        }
      } else {
        setToken('');
        setUid('');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await fetch('https://overtime-ddyl.onrender.com/api/equipos');
        const data = await res.json();
        setEquipos(data);
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      }
    };
    fetchEquipos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!liga.trim()) return alert('Debes ingresar el nombre de la liga.');
    if (!modalidad) return alert('Debes seleccionar una modalidad.');
    if (!categoria) return alert('Debes seleccionar una categoría.');
    if (!fecha) return alert('Debes seleccionar una fecha.');
    if (!equipoLocal) return alert('Debes seleccionar el equipo local.');
    if (!equipoVisitante) return alert('Debes seleccionar el equipo visitante.');
    if (equipoLocal === equipoVisitante) return alert('El equipo local y el equipo visitante no pueden ser el mismo.');

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return alert('Debes estar autenticado para agregar un partido.');

    const token = await getIdToken(user);

    const hoy = new Date();
    const fechaPartido = new Date(fecha);

    const estado = fechaPartido < hoy ? 'finalizado' : 'programado';

    const partido = {
      liga,
      modalidad,
      categoria,
      fecha: fechaPartido.toISOString(),
      equipoLocal,
      equipoVisitante,
      estado,
    };

    try {
      const response = await fetch('https://overtime-ddyl.onrender.com/api/partidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(partido),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Partido agregado exitosamente');
        setLiga('');
        setModalidad('');
        setCategoria('');
        setFecha('');
        setEquipoLocal('');
        setEquipoVisitante('');
      } else {
        alert(`Error al agregar partido: ${data.error || data.message || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
      alert('Hubo un error al agregar el partido');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Anotar Partido</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Liga */}
        <input
          name="liga"
          placeholder="Nombre de la Liga"
          value={liga}
          onChange={e => setLiga(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Modalidad */}
        <div className="block text-gray-700">
          <span>Modalidad:</span>
          <div className="mt-1 flex flex-col sm:flex-row sm:gap-6 gap-3">
            {modalidadOptions.map(({ value, label }) => (
              <label key={value} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="modalidad"
                  value={value}
                  checked={modalidad === value}
                  onChange={e => setModalidad(e.target.value)}
                  className="form-radio text-blue-600"
                  required
                />
                <span className="ml-2">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categoría */}
        <div className="block text-gray-700 mt-5">
          <span>Categoría:</span>
          <div className="mt-1 flex flex-col sm:flex-row sm:gap-6 gap-3">
            {categoriaOptions.map(({ value, label }) => (
              <label key={value} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="categoria"
                  value={value}
                  checked={categoria === value}
                  onChange={e => setCategoria(e.target.value)}
                  className="form-radio text-green-600"
                  required
                />
                <span className="ml-2">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <input
          name="fecha"
          type="date"
          placeholder="Fecha del Partido"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Equipo Local */}
        <select
          name="equipoLocal"
          value={equipoLocal}
          onChange={e => setEquipoLocal(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="" disabled>Seleccionar Equipo Local</option>
          {equipos.map(eq => (
            <option key={eq._id} value={eq._id}>{eq.nombre}</option>
          ))}
        </select>

        {/* Equipo Visitante */}
        <select
          name="equipoVisitante"
          value={equipoVisitante}
          onChange={e => setEquipoVisitante(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="" disabled>Seleccionar Equipo Visitante</option>
          {equipos.map(eq => (
            <option key={eq._id} value={eq._id}>{eq.nombre}</option>
          ))}
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anotar Partido
        </button>
      </form>
    </div>
  );
};

export default AgregarPartido;
