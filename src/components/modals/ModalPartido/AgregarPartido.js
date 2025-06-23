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
  const [uid, setUid] = useState('');
  // Define static options for modality and category
  const modalidadOptions = [
    { value: 'Foam', label: 'Foam' },
    { value: 'Cloth', label: 'Cloth' },
  ];

  const categoriaOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Mixto', label: 'Mixto' },
    { value: 'Libre', label: 'Libre' }
  ];

  // --- Fetch Authentication Token ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idToken = await getIdToken(user, true); // Forzamos nuevo token
          setToken(idToken);
          setUid(user.uid); // <-- Guardamos UID
        } catch (error) {
          console.error("Error al obtener el token:", error);
          setToken('');
          setUid('');
        }
      } else {
        setToken('');
        setUid('');
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

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Debes estar autenticado para agregar un partido.');
      return;
    }
      if (!liga.trim()) {
    alert('Debes ingresar el nombre de la liga.');
    return;
    }
    if (!modalidad) {
      alert('Debes seleccionar una modalidad.');
      return;
    }
    if (!categoria) {
      alert('Debes seleccionar una categoría.');
      return;
    }
    if (!fecha) {
      alert('Debes seleccionar una fecha.');
      return;
    }
    if (!equipoLocal) {
      alert('Debes seleccionar el equipo local.');
      return;
    }
    if (!equipoVisitante) {
      alert('Debes seleccionar el equipo visitante.');
      return;
    }
    if (equipoLocal === equipoVisitante) {
      alert('El equipo local y el equipo visitante no pueden ser el mismo.');
      return;
    }

    const token = await getIdToken(user); // ✅ token actualizado

    if (equipoLocal === equipoVisitante) {
      alert('El equipo local y el equipo visitante no pueden ser el mismo.');
      return;
    }

      const hoy = new Date();
      const fechaPartido = new Date(fecha);

      let estado = 'programado'; // default
      if (fechaPartido < hoy) {
        estado = 'finalizado';
      }

    const partido = {
      liga,
      modalidad,
      categoria,
      fecha: new Date(fecha).toISOString(),
      equipoLocal,
      equipoVisitante,
      estado,
    };

    try {
      console.log('Datos del partido a enviar:', JSON.stringify(partido, null, 2));
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
        setLiga('');
        setModalidad('');
        setCategoria('');
        setFecha('');
        setEquipoLocal('');
        setEquipoVisitante('');
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

        <Button type="submit" variant="success" disabled={false}>
          Anotar Partido
        </Button>
      </form>
    </div>
  );
};

export default AgregarPartido;