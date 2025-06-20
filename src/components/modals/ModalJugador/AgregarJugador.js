import React, { useState } from 'react';
import Button from '../../common/FormComponents/Button';
import InputText from '../../common/FormComponents/InputText';
import { useAuth } from '../../../context/AuthContext';

const AgregarJugador = () => {
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const { user, token } = useAuth();
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('otro');
  const [foto, setFoto] = useState('');
 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const jugador = {
      nombre,
      alias,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      genero,
      foto,
    };

    try {
      const response = await fetch('https://overtime-ddyl.onrender.com/api/jugadores', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jugador),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Jugador agregado exitosamente');
        // Opcional: limpiar campos
        setNombre('');
        setAlias('');
        setFechaNacimiento('');
        setGenero('otro');
        setFoto('');
      } else {
        alert(`Error: ${data.message || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error al agregar jugador:', error);
      alert('Hubo un error al agregar el jugador');
    }
  };

    const commonInputProps = {
    className: 'input-field',
  };
  return (
    <div className="wrapper">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Agregar Jugador</h2>

        <InputText
          name="nombre"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />

        <InputText
          name="alias"
          placeholder="Apodo (opcional)"
          value={alias}
          onChange={e => setAlias(e.target.value)}
        />

        <InputText
          name="fechaNacimiento"
          type="date"
          placeholder="Fecha de Nacimiento"
          value={fechaNacimiento}
          onChange={e => setFechaNacimiento(e.target.value)}
          {...commonInputProps}
        />

        <label>
          Género:
          <select name="genero" value={genero} onChange={e => setGenero(e.target.value)}>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </label>

        <InputText
          name="foto"
          placeholder="URL Foto (opcional)"
          value={foto}
          onChange={e => setFoto(e.target.value)}
        />

        <Button type="submit" variant="success">
          Agregar Jugador
        </Button>
      </form>
    </div>
  );
};

export default AgregarJugador;
