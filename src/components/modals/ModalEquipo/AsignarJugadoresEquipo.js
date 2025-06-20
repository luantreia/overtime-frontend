import React, { useState, useEffect } from 'react';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';
import Button from '../../common/FormComponents/Button';
import { fetchJugadores } from '../../../services/jugadorService';
import { useAuth } from '../../../context/AuthContext';

export default function AsignarJugadoresEquipo({ equipoId, onAsignar, onCancelar }) {
  const { user, token } = useAuth(); // <-- obtenemos el token del contexto
  const [jugadores, setJugadores] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarTodos = async () => {
      setLoading(true);
      try {
        const data = await fetchJugadores();
        setJugadores(data);
      } catch (error) {
        console.error('Error cargando jugadores:', error);
        setJugadores([]);
      } finally {
        setLoading(false);
      }
    };
    cargarTodos();
  }, []);

  const opciones = jugadores.map(j => ({
    value: j._id,
    label: j.nombre || 'Sin nombre',
  }));

  useEffect(() => {
  console.log('UID actual:', user?.uid);
  console.log('Token usado en la petición:', token);
}, [user]);

  const handleAsignar = async () => {
    if (!seleccionado) return;

    console.log('Token usado en la petición:', token);
    console.log('UID actual:', user?.uid);
    try {
      const res = await fetch('https://overtime-ddyl.onrender.com/api/jugador-equipo/asociar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,  // <-- enviamos token aquí
        },
        body: JSON.stringify({
          jugador: seleccionado,
          equipo: equipoId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al asignar jugador');
      }

      onAsignar(); // actualizar lista en el padre
    } catch (error) {
      console.error('Error en handleAsignar:', error);
      alert('Hubo un error al asignar el jugador');
    }
  };

  return (
    <div style={{ minWidth: 300, padding: 20, backgroundColor: 'var(--color-fondo-secundario)', borderRadius: 12 }}>
      <h3>Asignar jugador al equipo</h3>
      {loading ? (
        <p>Cargando jugadores...</p>
      ) : (
        <>
          <SelectDropdown
            options={opciones}
            value={seleccionado}
            onChange={e => setSeleccionado(e.target.value)}
            placeholder="Selecciona un jugador..."
          />
          <div style={{ marginTop: 20 }}>
            <Button onClick={handleAsignar} disabled={!seleccionado}>
              Asignar
            </Button>
            <Button onClick={onCancelar} variant="secondary" style={{ marginLeft: 10 }}>
              Cancelar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
