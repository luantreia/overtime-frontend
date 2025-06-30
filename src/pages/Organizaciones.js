import React, { useState, useEffect } from 'react';
import { useOrganizaciones } from '../hooks/useOrganizaciones';

export default function Organizaciones() {
  const { organizaciones, loading, error, agregarOrganizacion, cargarOrganizaciones } = useOrganizaciones();

  const [orden, setOrden] = useState('nombre_asc');
  const [organizacionesOrdenadas, setOrganizacionesOrdenadas] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Ordenar organizaciones cuando cambian o cambia criterio
  useEffect(() => {
    if (organizaciones.length > 0) {
      const ordenadas = ordenarOrganizaciones([...organizaciones], orden);
      setOrganizacionesOrdenadas(ordenadas);
      setPaginaActual(1);
    }
  }, [organizaciones, orden]);

  const ordenarOrganizaciones = (lista, criterio) => {
    switch (criterio) {
      case 'nombre_asc':
        return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  };

  // Paginación
  const indiceUltimo = paginaActual * itemsPorPagina;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const organizacionesPagina = organizacionesOrdenadas.slice(indiceInicio, indiceUltimo);
  const totalPaginas = Math.ceil(organizacionesOrdenadas.length / itemsPorPagina);

  const cambiarPagina = (num) => {
    if (num >= 1 && num <= totalPaginas) {
      setPaginaActual(num);
    }
  };

  // Render paginación simple
  const renderPaginacion = () => {
    const botones = [];
    for (let i = 1; i <= totalPaginas; i++) {
      botones.push(
        <button
          key={i}
          onClick={() => cambiarPagina(i)}
          disabled={i === paginaActual}
          style={{
            margin: '0 4px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: i === paginaActual ? '2px solid var(--color-secundario)' : '1px solid #ccc',
            backgroundColor: i === paginaActual ? 'var(--color-secundario)' : 'white',
            color: i === paginaActual ? 'white' : 'black',
            cursor: i === paginaActual ? 'default' : 'pointer',
          }}
          aria-current={i === paginaActual ? 'page' : undefined}
          aria-label={`Página ${i}`}
        >
          {i}
        </button>
      );
    }
    return botones;
  };

  return (
    <div className="p-2">
      <div className="selector" style={{ marginBottom: 16 }}>
        <label htmlFor="orden" className="block mb-2 font-semibold text-gray-700">
          Ordenar por:
        </label>
        <select
          id="orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="aleatorio">Orden aleatorio</option>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
        </select>
      </div>

      {loading && <p>Cargando organizaciones...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div className="lista" aria-live="polite">
        {organizacionesPagina.map((org) => (
          <div
            key={org._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '12px',
              cursor: 'pointer',
            }}
            onClick={() => alert(`Seleccionaste la organización: ${org.nombre}`)}
          >
            <h3 style={{ fontWeight: 'bold' }}>{org.nombre}</h3>
            {org.descripcion && <p>{org.descripcion}</p>}
          </div>
        ))}
      </div>

      <nav
        aria-label="Paginación de organizaciones"
        style={{ textAlign: 'center', marginTop: 20, marginBottom: 40 }}
      >
        {renderPaginacion()}
      </nav>
    </div>
  );
}
