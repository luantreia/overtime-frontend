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
    equipo: jugador.equipo?._id || jugador.equipo || '',
    edad: jugador.edad || '',
  });

  const [equipos, setEquipos] = useState([]);

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
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('Usuario no autenticado');
        return;
      }

      const idToken = await getIdToken(user);

      const payload = {
        nombre: formData.nombre,
        foto: formData.foto,
        posicion: formData.posicion,
        equipo: formData.equipo,
        edad: formData.edad,
      };

      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/jugadores/${jugador._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error('Error al guardar');

      const actualizado = await res.json();
      onGuardar(actualizado);
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    }
  };

  return (
    <div className="container" onClick={onCancelar}>
      <div className="overlay" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="form">
          <h3 className="text">Editar jugador</h3>
          <InputText
            placeholder="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <InputText
            placeholder="Foto (URL)"
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
            options={equipos.map(e => ({ label: e.nombre, value: e._id }))}
          />
          <InputText
            placeholder="Edad"
            name="edad"
            type="number"
            min="0"
            value={formData.edad}
            onChange={handleChange}
          />
          <div>
            <Button type="submit" variant="primary">Guardar</Button>
            <Button type="button" variant="danger" onClick={onCancelar}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
