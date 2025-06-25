import React, { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';

const AgregarEquipo = () => {
  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [escudo, setEscudo] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idToken = await getIdToken(user);
          setToken(idToken);
        } catch (error) {
          console.error("Error al obtener el token:", error);
          setToken('');
        }
      } else {
        setToken('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Debes estar autenticado para agregar un equipo.');
      return;
    }

    const equipo = { nombre, escudo, foto };

    try {
      const response = await fetch('https://overtime-ddyl.onrender.com/api/equipos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(equipo),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Equipo agregado exitosamente');
        setNombre('');
        setFoto('');
        setEscudo('');
      } else {
        alert(`Error al agregar equipo: ${data.message || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
      alert('Hubo un error al agregar el equipo');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Anotar Equipo</h2>
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
          name="escudo"
          placeholder="URL Escudo"
          value={escudo}
          onChange={e => setEscudo(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="foto"
          placeholder="URL Foto"
          value={foto}
          onChange={e => setFoto(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anotar Equipo
        </button>
      </form>
    </div>
  );
};

export default AgregarEquipo;
