// ./src/components/users/AgregarJugador.js
import React, { useEffect, useState } from 'react';

const AgregarJugador = () => {
  const [nombre, setNombre] = useState('');
  const [posicion, setPosicion] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [edad, setEdad] = useState('');
  const [foto, setFoto] = useState('');
  const [equipos, setEquipos] = useState([]);

  
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
    
  const handleSubmit = async (e) => {
    e.preventDefault();

    const jugador = {
      nombre,
      posicion,
      equipoId,
      edad,
      foto,
    };

    try {
      const response = await fetch('https://overtime-ddyl.onrender.com/api/jugadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jugador),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      if (response.ok) {
        alert('Jugador agregado exitosamente');
      } else {
        alert(`Error al agregar jugador: ${data.message || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
      alert('Hubo un error al agregar el jugador');
    }
  };

  return (
    <div className="container">
      <form className='form' onSubmit={handleSubmit} >
      <h2>Agregar Jugador</h2> 
          <input
            type="text"
            placeholder='Nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder='Posicion'
            value={posicion}
            onChange={(e) => setPosicion(e.target.value)}
          />
          <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
          <option value="">Equipo</option>
          {equipos.map((equipo) => (
            <option key={equipo._id} value={equipo._id}>
              {equipo.nombre}
            </option>
          ))}
        </select>
          <input
            type="number"
            placeholder='Edad'
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
          />
          <input
            type="text"
            placeholder='Foto URL'
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
          />
        <button className='button' type="submit">Agregar Jugador</button>
      </form>
    </div>
  );
};

export default AgregarJugador;
