import React, { useState, useEffect } from 'react';
import TarjetaPartido from '../components/modals/ModalPartido/TarjetaPartido.js';
import ModalPartido from '../components/modals/ModalPartido/Modalpartido.js';
import { usePartidos } from '../hooks/usePartidos.js';
import { useAuth } from '../context/AuthContext'; 

export default function Partidos() {
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [ordenLista, setOrdenLista] = useState('aleatorio');
  const [partidosOrdenados, setPartidosOrdenados] = useState([]);
  const { token } = useAuth(); 
  // Usamos el hook personalizado
  const {
    partidos,
    cargando,
    agregarSetAPartido,
    actualizarSetDePartido,
    eliminarPartidoPorId,
    cargarPartidoPorId,
    // ...otros
  } = usePartidos(token, ordenLista);

  
  useEffect(() => {
    if (partidos.length > 0) {
      const ordenados = ordenarPartidos([...partidos], ordenLista);
      setPartidosOrdenados(ordenados);
    }
  }, [partidos, ordenLista]);
  
  const ordenarPartidos = (lista, criterio) => {
    switch (criterio) {
      case 'fecha_asc':
        return lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        case 'fecha_desc':
          return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          case 'estado':
            return lista.sort((a, b) => a.estado.localeCompare(b.estado));
            case 'aleatorio':
              return lista.sort(() => Math.random() - 0.5);
              default:
                return lista;
              }
            };
            
  const refrescarPartidoSeleccionado = async () => {
    if (!partidoSeleccionado) return;
    const refreshed = await cargarPartidoPorId(partidoSeleccionado._id);
    setPartidoSeleccionado(refreshed);
  };

  const handleOrdenChange = (e) => {
    setOrdenLista(e.target.value);
  };

  if (cargando) {
    return <p style={{ textAlign: 'center', marginTop: 40 }}>Cargando partidos...</p>;
  }

  const handleSeleccionarPartido = async (partido) => {
    const partidoCompleto = await cargarPartidoPorId(partido._id);
    if (partidoCompleto) {
      setPartidoSeleccionado(partidoCompleto);
    } else {
      // fallback, en caso de error usa el partido simple
      setPartidoSeleccionado(partido);
    }
  };

  return (
    <div>
      <div className='selector'>
        <label htmlFor="orden">Ordenar por: </label>
        <select id="orden" value={ordenLista} onChange={handleOrdenChange}>
          <option value="fecha_desc">Fecha (más reciente primero)</option>
          <option value="fecha_asc">Fecha (más antigua primero)</option>
          <option value="estado">Estado</option>
          <option value="aleatorio">Orden aleatorio</option>
        </select>
      </div>

      <div className='lista'>
        {partidosOrdenados.map((p) => (
          <TarjetaPartido
            key={p._id}
            partido={p}
            onClick={() => handleSeleccionarPartido(p)}
          />
        ))}
      </div>

      {partidoSeleccionado && (
        <ModalPartido
          partido={partidoSeleccionado}
          onClose={() => setPartidoSeleccionado(null)}
          token={token}
          agregarSetAPartido={agregarSetAPartido}
          actualizarSetDePartido={actualizarSetDePartido}
          cargarPartidoPorId={cargarPartidoPorId}
          refrescarPartidoSeleccionado={refrescarPartidoSeleccionado}
        />
      )}
    </div>
  );
}
