import React, { useState, useEffect } from 'react';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';
import Button from '../../common/FormComponents/Button';
import { fetchJugadores } from '../../../services/jugadorService';
import { useAuth } from '../../../context/AuthContext';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

export default function AsignarJugadoresEquipo({ equipoId, onAsignar, onCancelar }) {
  const { token } = useAuth(); // solo usamos el token si querés pasarlo manualmente
  const [jugadores, setJugadores] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);

  const { asociarJugador } = useJugadorEquipo({ equipoId, token }); // usamos el hook

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

  const handleAsignar = async () => {
    if (!seleccionado) return;

    try {
      await asociarJugador({ jugador: seleccionado, equipo: equipoId });
      onAsignar(); // notificar al padre para cerrar y recargar
    } catch (error) {
      console.error('Error al asignar jugador:', error);
      alert(error.message || 'Error al asignar el jugador');
    }
  };

  return (
    <div style={{ minWidth: 300, padding: 20, backgroundColor: 'var(--color-fondo-secundario)', borderRadius: 12 }}>
      <h3 className="text-lg font-semibold mb-3">Asignar jugador al equipo</h3>
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
          <div className="mt-4 flex gap-3">
            <Button onClick={handleAsignar} disabled={!seleccionado}>
              Asignar
            </Button>
            <Button onClick={onCancelar} variant="secondary">
              Cancelar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
