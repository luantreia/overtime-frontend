// src/components/modals/ModalJugador/EditarJugador.js
import React, { useState, useEffect } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';
import InputText from '../../common/FormComponents/InputText';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';
import Button from '../../common/FormComponents/Button';

export default function EditarJugador({ jugador, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: jugador.nombre || '',
    foto: jugador.foto || '',
    posicion: jugador.posicion || '',
    equipo: jugador.equipo?._id || '',
    edad: jugador.edad || '',
  });
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const payload = {
        ...formData,
        equipo: formData.equipo,
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

  const equipoOptions = [
    { value: '', label: '— Seleccioná un equipo —' },
    ...equipos.map(eq => ({ value: eq._id, label: eq.nombre })),
  ];

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
      <h3>Editar Jugador</h3>
        <InputText
          placeholder="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        <InputText
          placeholder="URL Foto"
          name="foto"
          value={formData.foto}
          onChange={handleChange}
        />
        <InputText
          placeholder="Posición"
          name="posicion"
          value={formData.posicion}
          onChange={handleChange}
        />
        <SelectDropdown
          placeholder="Equipo"
          name="equipo"
          value={formData.equipo}
          onChange={handleChange}
          options={equipoOptions}
        />
        <InputText
          placeholder="Edad"
          name="edad"
          type="number"
          value={formData.edad}
          onChange={handleChange}
        />
        <div className="flex gap-3 justify-between mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button type="button" onClick={onCancelar} variant='danger' disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleEliminar} variant='secondary' disabled={loading}>
            Eliminar
          </Button>
        </div>
      </form>
    </div>
  );
}
