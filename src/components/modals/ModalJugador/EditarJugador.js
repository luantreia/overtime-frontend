// src/components/modals/ModalJugador/EditarJugador.js
import React, { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';

export default function EditarJugador({ jugador, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: jugador.nombre || '',
    foto: jugador.foto || '',
    posicion: jugador.posicion || '',
    equipo: jugador.equipo?._id || '',   // guardamos aquí el _id del equipo
    edad: jugador.edad || '',
  });
  const [equipos, setEquipos] = useState([]);   // lista de equipos para el dropdown
  const [loading, setLoading] = useState(false);

  // Al montar, traemos los equipos
  useEffect(() => {
    fetch('https://overtime-ddyl.onrender.com/api/equipos')
      .then(res => res.json())
      .then(data => setEquipos(data))
      .catch(err => console.error('Error al cargar equipos:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');
      const token = await getIdToken(user);

      // Enviamos equipo como equipoId
      const payload = {
        ...formData,
        equipo: formData.equipo
      };

      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/jugadores/${jugador._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Error al actualizar');
      const actualizado = await res.json();
      onGuardar(actualizado);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el jugador');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Seguro que querés eliminar este jugador?')) return;
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');
      const token = await getIdToken(user);

      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/jugadores/${jugador._id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Error al eliminar');
      alert('Jugador eliminado correctamente');
      onGuardar(null);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el jugador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modal}>
      <h3>Editar Jugador</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          style={styles.input}
        />
        <input
          name="foto"
          value={formData.foto}
          onChange={handleChange}
          placeholder="URL Foto"
          style={styles.input}
        />
        <input
          name="posicion"
          value={formData.posicion}
          onChange={handleChange}
          placeholder="Posición"
          style={styles.input}
        />
        {/* Dropdown de equipos */}
        <select
          name="equipo"
          value={formData.equipo}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">— Seleccioná un equipo —</option>
          {equipos.map(eq => (
            <option key={eq._id} value={eq._id}>
              {eq.nombre}
            </option>
          ))}
        </select>
        <input
          name="edad"
          type="number"
          value={formData.edad}
          onChange={handleChange}
          placeholder="Edad"
          style={styles.input}
        />
        <div style={styles.botones}>
          <button type="submit" style={styles.guardar} disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            style={styles.cancelar}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEliminar}
            style={styles.eliminar}
            disabled={loading}
          >
            Eliminar
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    maxWidth: 400,
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: 8,
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 14,
  },
  botones: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'space-between',
  },
  guardar: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelar: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  eliminar: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
