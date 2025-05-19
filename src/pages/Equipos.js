import React, { useState, useEffect } from 'react';
import TarjetaEquipo from '../components/common/tarjetaequipo.js';
import ModalEquipo from '../components/modals/ModalEquipo/ModalEquipo.js';

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  // Cargar equipos desde la API al montar el componente
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await fetch('https://overtime-ddyl.onrender.com/api/equipos');
        const data = await response.json();
        setEquipos(data);
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      }
    };

    fetchEquipos();
  }, []);

  return (
    <div>
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
  lista: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px',
  }
};


