// src/compoents/modals/ModalEquipo/AgregarEquipo.js

import React, { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth'; // Importa las funciones necesarias para obtener el token
import Button from '../../common/FormComponents/Button';
import InputText from '../../common/FormComponents/InputText';


const AgregarEquipo = () => {
  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [escudo, setEscudo] = useState('');
  const [token, setToken] = useState(''); // Estado para almacenar el token de autenticación

  useEffect(() => {
    // Obtiene el token de autenticación de Firebase al cargar el componente y cuando el usuario cambia.
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Si hay un usuario autenticado, obtén su token de ID.
        try {
          const idToken = await getIdToken(user);
          setToken(idToken);
        } catch (error) {
          console.error("Error al obtener el token:", error);
          // Manejar el error (por ejemplo, mostrar un mensaje al usuario)
          setToken(''); // Asegúrate de limpiar el token en caso de error.
        }
      } else {
        // Si no hay usuario autenticado, limpia el token.
        setToken('');
      }
    });

    // Limpia el listener cuando el componente se desmonta.
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Debes estar autenticado para agregar un equipo.');
      return; // Detiene el proceso si no hay token.
    }

    const equipo = {
      nombre,
      escudo,
      foto,
    };

    try {
      const response = await fetch('https://overtime-ddyl.onrender.com/api/equipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}`, },
        body: JSON.stringify(equipo),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (response.ok) {
        alert('Equipo agregado exitosamente');
        // Opcional: limpiar formulario
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
    <div className="container">
      <form className='form' onSubmit={handleSubmit}>
        <h2>Anotar Equipo</h2>
        <InputText
          name="nombre"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <InputText
          placeholder="URL Escudo"
          name="foto"
          value={escudo}
          onChange={e => setEscudo(e.target.value)}
        />
        <InputText
          placeholder="URL Foto"
          name="foto"
          value={foto}
          onChange={e => setFoto(e.target.value)}
        />
        <Button type="submit" variant="success" disabled={false}>
                    Anotar Equipo
        </Button>
      </form>
    </div>
  );
};

export default AgregarEquipo;
