import React, { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';
import { usePartidos } from '../../../hooks/usePartidos';
import { useFases } from '../../../hooks/useFases';
import { useParticipacionFase } from '../../../hooks/useParticipacionFase';

const AgregarPartido = () => {
  // Estados formulario
  const [competencias, setCompetencias] = useState([]);
  const [liga, setLiga] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fecha, setFecha] = useState('');
  const [faseSeleccionada, setFaseSeleccionada] = useState('');
  const [equipoLocal, setEquipoLocal] = useState('');
  const [equipoVisitante, setEquipoVisitante] = useState('');
  const [equiposFase, setEquiposFase] = useState([]);

  // Firebase user y token
  const auth = getAuth();
  const user = auth.currentUser;
  const [token, setToken] = useState(null);

  // Obtener token cuando usuario cambia
  useEffect(() => {
    if (user) {
      getIdToken(user).then(setToken);
    } else {
      setToken(null);
    }
  }, [user]);

  // Hooks externos
  const { fases, loading: loadingFases, error: errorFases } = useFases(liga);
  const { participaciones, fetchParticipaciones, loading: loadingParticipaciones, error: errorParticipaciones } = useParticipacionFase();
  const { crearNuevoPartido, loading: loadingPartido, error: errorPartido } = usePartidos(token);

  // Cargar competencias al montar
  useEffect(() => {
    const fetchCompetencias = async () => {
      try {
        const res = await fetch('https://overtime-ddyl.onrender.com/api/competencias');
        const data = await res.json();
        setCompetencias(data);
      } catch (error) {
        console.error('Error al obtener competencias:', error);
      }
    };
    fetchCompetencias();
  }, []);

  // Cuando cambia la liga, setear modalidad y categoría y resetear dependientes
  useEffect(() => {
    if (!liga) {
      setModalidad('');
      setCategoria('');
      setFaseSeleccionada('');
      setEquiposFase([]);
      setEquipoLocal('');
      setEquipoVisitante('');
      return;
    }
    const competencia = competencias.find(c => c._id === liga);
    if (competencia) {
      setModalidad(competencia.modalidad);
      setCategoria(competencia.categoria);
    } else {
      setModalidad('');
      setCategoria('');
    }
    setFaseSeleccionada('');
    setEquiposFase([]);
    setEquipoLocal('');
    setEquipoVisitante('');
  }, [liga, competencias]);

  // Cuando cambia fase, cargar participaciones (equipos en fase)
  useEffect(() => {
    if (faseSeleccionada) {
      fetchParticipaciones({ fase: faseSeleccionada });
    } else {
      setEquiposFase([]);
      setEquipoLocal('');
      setEquipoVisitante('');
    }
  }, [faseSeleccionada, fetchParticipaciones]);

  // Actualizar equiposFase a partir de participaciones
  useEffect(() => {
    if (!participaciones || participaciones.length === 0) {
      setEquiposFase([]);
      return;
    }
    const equiposConNombre = participaciones.map(pf => {
      const eqCompetencia = pf.equipoCompetencia;
      const equipo = eqCompetencia?.equipo;
      return {
        _id: equipo?._id || eqCompetencia?._id || 'id-desconocido',
        nombre: equipo?.nombre || 'Equipo sin nombre',
      };
    });
    setEquiposFase(equiposConNombre);
    setEquipoLocal('');
    setEquipoVisitante('');
  }, [participaciones]);

  // Cambiar liga
  const handleCompetenciaChange = (e) => {
    setLiga(e.target.value);
  };

  // Submit form: crear partido usando hook usePartidos
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (liga !== '' && !liga.trim()) return alert('Debes seleccionar la liga.');
    if (!modalidad) return alert('Debes seleccionar una modalidad.');
    if (!categoria) return alert('Debes seleccionar una categoría.');
    if (!fecha) return alert('Debes seleccionar una fecha.');
    if (!equipoLocal) return alert('Debes seleccionar el equipo local.');
    if (!equipoVisitante) return alert('Debes seleccionar el equipo visitante.');
    if (equipoLocal === equipoVisitante) return alert('El equipo local y el equipo visitante no pueden ser el mismo.');
    if (liga !== '' && !faseSeleccionada) return alert('Debes seleccionar una fase.');

    if (!token) {
      alert('Debes estar autenticado para agregar un partido.');
      return;
    }

    const hoy = new Date();
    const fechaPartido = new Date(fecha);

    const estado = fechaPartido < hoy ? 'finalizado' : 'programado';

    const partido = {
      competencia: liga || null,
      fase: liga ? faseSeleccionada || null : null,
      modalidad,
      categoria,
      fecha: fechaPartido.toISOString(),
      equipoLocal,
      equipoVisitante,
      estado,
    };

    await crearNuevoPartido(partido, (creado) => {
      if (creado) {
        alert('Partido agregado exitosamente');
        // Limpiar formulario
        setLiga('');
        setModalidad('');
        setCategoria('');
        setFecha('');
        setFaseSeleccionada('');
        setEquipoLocal('');
        setEquipoVisitante('');
        setEquiposFase([]);
      }
    });
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Anotar Partido</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Competencia (Liga) */}
        <select
          name="competencia"
          value={liga}
          onChange={handleCompetenciaChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Amistoso (sin competencia)</option>
          {competencias.map(c => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>

        {/* Fase */}
        {liga && (
          <>
            {loadingFases && <p>Cargando fases...</p>}
            {errorFases && <p className="text-red-600">Error al cargar fases: {errorFases}</p>}

            {fases.length > 0 ? (
              <select
                name="fase"
                value={faseSeleccionada}
                onChange={e => setFaseSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Seleccionar Fase</option>
                {fases.map(f => (
                  <option key={f._id} value={f._id}>{f.nombre}</option>
                ))}
              </select>
            ) : (
              <p>No hay fases disponibles para esta competencia.</p>
            )}
          </>
        )}

        {/* Modalidad */}
        <div className="block text-gray-700">
          <span>Modalidad:</span>
          <div className="mt-1 flex flex-col sm:flex-row sm:gap-6 gap-3">
            {['Foam', 'Cloth'].map((mod) => (
              <label key={mod} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="modalidad"
                  value={mod}
                  checked={modalidad === mod}
                  onChange={e => setModalidad(e.target.value)}
                  className="form-radio text-blue-600"
                  disabled={!!liga}
                  required
                />
                <span className="ml-2">{mod}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categoría */}
        <div className="block text-gray-700 mt-5">
          <span>Categoría:</span>
          <div className="mt-1 flex flex-col sm:flex-row sm:gap-6 gap-3">
            {['Masculino', 'Femenino', 'Mixto', 'Libre'].map((cat) => (
              <label key={cat} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="categoria"
                  value={cat}
                  checked={categoria === cat}
                  onChange={e => setCategoria(e.target.value)}
                  className="form-radio text-green-600"
                  disabled={!!liga}
                  required
                />
                <span className="ml-2">{cat}</span>
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
          disabled={!faseSeleccionada}
        >
          <option value="" disabled>Seleccionar Equipo Local</option>
          {equiposFase.map(eq => (
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
          disabled={!faseSeleccionada}
        >
          <option value="" disabled>Seleccionar Equipo Visitante</option>
          {equiposFase.map(eq => (
            <option key={eq._id} value={eq._id}>{eq.nombre}</option>
          ))}
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loadingPartido || loadingParticipaciones}
        >
          {loadingPartido ? 'Guardando...' : 'Anotar Partido'}
        </button>

        {(errorPartido || errorParticipaciones) && (
          <p className="text-red-600 mt-2 text-center">{errorPartido || errorParticipaciones}</p>
        )}
      </form>
    </div>
  );
};

export default AgregarPartido;
