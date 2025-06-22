import React, { useState } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';
import InputText from '../../common/FormComponents/InputText';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';
import Button from '../../common/FormComponents/Button';

export default function EditarJugador({ jugador, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: jugador.nombre || '',
    alias: jugador.alias || '',
    foto: jugador.foto || '',
    fechaNacimiento: jugador.fechaNacimiento ? jugador.fechaNacimiento.slice(0, 10) : '',
    genero: jugador.genero || 'otro',
  });

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
        alias: formData.alias,
        foto: formData.foto,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
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
            placeholder="Alias"
            name="alias"
            value={formData.alias}
            onChange={handleChange}
          />

          <InputText
            placeholder="Foto (URL)"
            name="foto"
            value={formData.foto}
            onChange={handleChange}
          />

          <InputText
            type="date"
            placeholder="Fecha de nacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
          />

          <SelectDropdown
            placeholder="Género"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            options={[
              { label: 'Masculino', value: 'masculino' },
              { label: 'Femenino', value: 'femenino' },
              { label: 'Otro', value: 'otro' },
            ]}
          />

          <div>
            <Button type="submit" variant="primary">Guardar</Button>
            <Button type="button" variant="danger" onClick={onCancelar}>Cancelar</Button>
          </div>
        </form>
      </div>
  );
}
