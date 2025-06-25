import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const AgregarJugador = () => {
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const { token } = useAuth();
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

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Anotar Jugador</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="nombre"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="alias"
          placeholder="Apodo (opcional)"
          value={alias}
          onChange={e => setAlias(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="fechaNacimiento"
          type="date"
          placeholder="Fecha de Nacimiento"
          value={fechaNacimiento}
          onChange={e => setFechaNacimiento(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="block text-gray-700">
          <span>Género:</span>
          <div className="mt-1 flex flex-col sm:flex-row sm:gap-4 gap-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="genero"
                value="masculino"
                checked={genero === 'masculino'}
                onChange={e => setGenero(e.target.value)}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">Masculino</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                name="genero"
                value="femenino"
                checked={genero === 'femenino'}
                onChange={e => setGenero(e.target.value)}
                className="form-radio text-pink-600"
              />
              <span className="ml-2">Femenino</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                name="genero"
                value="otro"
                checked={genero === 'otro'}
                onChange={e => setGenero(e.target.value)}
                className="form-radio text-gray-600"
              />
              <span className="ml-2">Otro</span>
            </label>
          </div>
        </div>

        <input
          name="foto"
          placeholder="URL Foto (opcional)"
          value={foto}
          onChange={e => setFoto(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anotar Jugador
        </button>
      </form>
    </div>
  );
};

export default AgregarJugador;
