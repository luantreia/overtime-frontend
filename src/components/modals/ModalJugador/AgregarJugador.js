// ./src/components/users/AgregarJugador.js
import React, { useEffect, useState } from 'react';
import Button from '../../common/FormComponents/Button';
import InputText from '../../common/FormComponents/InputText';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';

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
          <InputText
          name="nombre"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          />
          <InputText
          name="posicion"
          placeholder="Posicion"
          value={posicion}
          onChange={e => setPosicion(e.target.value)}
          />
          <SelectDropdown
            name={`equipo`}
            value={equipoId}
            onChange={e => setEquipoId( 'equipoId', e.target.value)}
            options={equipos.map(eq => ({ value: eq._id, label: eq.nombre }))}
            placeholder="Equipo"
          />
          <InputText
            name="edad"
            type="number"
            placeholder='Edad'
            value={edad}
            onChange={e => setEdad(e.target.value)}
          />
          <InputText
            placeholder="URL Foto"
            name="foto"
            value={foto}
            onChange={e => setFoto(e.target.value)}
          />
          <Button type="submit" variant="success" disabled={false}>
            Agregar Jugador
          </Button>
      </form>
    </div>
  );
};

export default AgregarJugador;
