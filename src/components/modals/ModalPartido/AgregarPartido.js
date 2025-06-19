// src/components/modals/ModalPartido/AgregarPartido.js

import React, { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';
import Button from '../../common/FormComponents/Button';
import InputText from '../../common/FormComponents/InputText';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';

const AgregarPartido = () => {
  const [liga, setLiga] = useState(''); // Changed to string input for now
  const [modalidad, setModalidad] = useState(''); // Now a select dropdown
  const [categoria, setCategoria] = useState(''); // Now a select dropdown
  const [fecha, setFecha] = useState('');
  const [equipoLocal, setEquipoLocal] = useState('');
  const [equipoVisitante, setEquipoVisitante] = useState('');
  const [marcadorLocal, setMarcadorLocal] = useState('');
  const [marcadorVisitante, setMarcadorVisitante] = useState('');

  // No need to fetch 'ligas' yet, but keeping 'equipos'
  const [equipos, setEquipos] = useState([]);
  const [token, setToken] = useState('');

  // Define static options for modality and category
  const modalidadOptions = [
    { value: 'Foam', label: 'Foam' },
    { value: 'Cloth', label: 'Cloth' },
  ];

  const categoriaOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Mixto', label: 'Mixto' },
  ];

  // --- Fetch Authentication Token ---
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

  // --- Fetch Teams for Dropdowns ---
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const equiposResponse = await fetch('https://overtime-ddyl.onrender.com/api/equipos');
        const equiposData = await equiposResponse.json();
        setEquipos(equiposData);
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      }
    };
    fetchEquipos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Debes estar autenticado para agregar un partido.');
      return;
    }

    if (equipoLocal === equipoVisitante) {
      alert('El equipo local y el equipo visitante no pueden ser el mismo.');
      return;
    }

    const partido = {
      liga, // Now just a string
      modalidad,
      categoria,
      fecha: new Date(fecha).toISOString(),
      equipoLocal, // Still sends team ID as a string
      equipoVisitante, // Still sends team ID as a string
      marcadorLocal: marcadorLocal !== '' ? parseInt(marcadorLocal, 10) : 0,
      marcadorVisitante: marcadorVisitante !== '' ? parseInt(marcadorVisitante, 10) : 0,
    };

    try {
      const response = await fetch('https://overtime-ddyl.onrender.com/api/partidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(partido),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (response.ok) {
        alert('Partido agregado exitosamente');
        // Clear form after successful submission
        setLiga('');
        setModalidad('');
        setCategoria('');
        setFecha('');
        setEquipoLocal('');
        setEquipoVisitante('');
        setMarcadorLocal('');
        setMarcadorVisitante('');
      } else {
        alert(`Error al agregar partido: ${data.error || data.message || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
      alert('Hubo un error al agregar el partido');
    }
  };

  const commonInputProps = {
    className: 'input-field',
  };

  return (
    <div className="wrapper">
      <form className='form' onSubmit={handleSubmit}>
        <h2>Anotar Partido</h2>

        {/* Liga as a text input */}
        <InputText
          name="liga"
          placeholder="Nombre de la Liga"
          value={liga}
          onChange={e => setLiga(e.target.value)}
          {...commonInputProps}
        />

        {/* Modalidad as a SelectDropdown */}
        <SelectDropdown
          name="modalidad"
          value={modalidad}
          onChange={e => setModalidad(e.target.value)}
          options={modalidadOptions}
          placeholder="Seleccionar Modalidad"
          {...commonInputProps}
        />

        {/* Categoría as a SelectDropdown */}
        <SelectDropdown
          name="categoria"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          options={categoriaOptions}
          placeholder="Seleccionar Categoría"
          {...commonInputProps}
        />

        <InputText
          name="fecha"
          type="date"
          placeholder="Fecha del Partido"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          {...commonInputProps}
        />

        <SelectDropdown
          name="equipoLocal"
          value={equipoLocal}
          onChange={e => setEquipoLocal(e.target.value)}
          options={equipos.map(eq => ({ value: eq._id, label: eq.nombre }))}
          placeholder="Seleccionar Equipo Local"
          {...commonInputProps}
        />

        <SelectDropdown
          name="equipoVisitante"
          value={equipoVisitante}
          onChange={e => setEquipoVisitante(e.target.value)}
          options={equipos.map(eq => ({ value: eq._id, label: eq.nombre }))}
          placeholder="Seleccionar Equipo Visitante"
          {...commonInputProps}
        />

        <InputText
          name="marcadorLocal"
          type="number"
          placeholder="Marcador Local"
          value={marcadorLocal}
          onChange={e => setMarcadorLocal(e.target.value)}
          {...commonInputProps}
        />
        <InputText
          name="marcadorVisitante"
          type="number"
          placeholder="Marcador Visitante"
          value={marcadorVisitante}
          onChange={e => setMarcadorVisitante(e.target.value)}
          {...commonInputProps}
        />

        <Button type="submit" variant="success" disabled={false}>
          Anotar Partido
        </Button>
      </form>
    </div>
  );
};

export default AgregarPartido;