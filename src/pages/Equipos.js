// src/pages/Equipos.js

import React, { useState, useEffect } from 'react';
import TarjetaEquipo from '../components/common/tarjetaequipo.js';
import ModalEquipo from '../components/modals/ModalEquipo/ModalEquipo.js';

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [orden, setOrden] = useState('aleatorio');

  // Función para ordenar equipos según criterio
  const ordenarEquipos = (equipos, criterio) => {
    const copia = [...equipos];
    switch (criterio) {
      case 'nombre_asc':
        return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'aleatorio':
        return copia.sort(() => Math.random() - 0.5);
      default:
        return copia;
    }
  };

  // Cargar equipos desde la API al montar el componente
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await fetch('https://overtime-ddyl.onrender.com/api/equipos');
        const data = await response.json();
        setEquipos(ordenarEquipos(data, orden));
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      }
    };

    fetchEquipos();
  }, [orden]);

  const handleOrdenChange = (e) => {
    const nuevoOrden = e.target.value;
    setOrden(nuevoOrden);
    setEquipos(eqs => ordenarEquipos(eqs, nuevoOrden));
  };

  return (
    <div>
      <div style={styles.selector}>
        <label htmlFor="orden">Ordenar por: </label>
        <select id="orden" value={orden} onChange={handleOrdenChange}>
          <option value="aleatorio">Orden aleatorio</option>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
        </select>
      </div>

      <div style={styles.lista}>
        {equipos.map((equipo, index) => (
          <TarjetaEquipo
            key={index}
            nombre={equipo.nombre}
            escudo={equipo.escudo}
            onClick={() => setEquipoSeleccionado(equipo)}
          />
        ))}
      </div>

      {equipoSeleccionado && (
        <ModalEquipo equipo={equipoSeleccionado} onClose={() => setEquipoSeleccionado(null)} />
      )}
    </div>
  );
}

const styles = {
  selector: {
    textAlign: 'center',
    margin: '1rem 0',
  },
  lista: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px',
  }
};
