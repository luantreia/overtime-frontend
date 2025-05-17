import React, { useState } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';


function EditarEquipo({ equipo, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: equipo.nombre || '',
    escudo: equipo.escudo || '',
    foto: equipo.foto || '',
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

    const res = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipo._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error('Error al guardar');

    const actualizado = await res.json();
    onGuardar(actualizado);
  } catch (err) {
    console.error(err);
    alert('Error al guardar');
  }
};


  return (
    <div style={styles.modal}>
      <h3>Editar equipo</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" style={styles.input} />
        <input name="escudo" value={formData.escudo} onChange={handleChange} placeholder="URL Escudo" style={styles.input} />
        <input name="foto" value={formData.foto} onChange={handleChange} placeholder="URL Foto" style={styles.input} />
        <div style={styles.botones}>
          <button type="submit" style={styles.guardar}>Guardar</button>
          <button type="button" onClick={onCancelar} style={styles.cancelar}>Cancelar</button>
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
    justifyContent: 'flex-end',
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
};

export default EditarEquipo;
