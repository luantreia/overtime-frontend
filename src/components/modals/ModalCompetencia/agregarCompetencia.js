import React, { useState, useEffect } from 'react';
import { useOrganizaciones } from '../../../hooks/useOrganizaciones';
import { getAuth, getIdToken } from 'firebase/auth';

export default function FormularioCompetencia({ onCreada }) {
  const [form, setForm] = useState({
    descripcion: '',
    organizacion: '',
    modalidad: 'Foam',
    categoria: 'Masculino',
    tipo: 'liga',
    temporada: '2025',
    fechaInicio: '',
    fechaFin: '',
    reglas: '',
  });
  
  const [token, setToken] = useState('');
  const { organizaciones } = useOrganizaciones();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const idToken = await getIdToken(user, true);
        setToken(idToken);
      } else {
        setToken('');
      }
    });
    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    if (!form.organizacion) {
      alert('Selecciona una organización');
      return false;
    }
    if (!form.fechaInicio) {
      alert('Ingresa la fecha de inicio');
      return false;
    }
    // Agrega otras validaciones si quieres
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    if (!token) {
      alert('Debes estar autenticado para crear una competencia');
      return;
    }

    try {
      const res = await fetch('https://overtime-ddyl.onrender.com/api/competencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Competencia creada: ${data.nombre}`);
        onCreada(data);
        // limpiar formulario:
        setForm({
          descripcion: '',
          organizacion: '',
          modalidad: 'Foam',
          categoria: 'Masculino',
          tipo: 'liga',
          temporada: '2025',
          fechaInicio: '',
          fechaFin: '',
          reglas: '',
        });
      } else {
        alert(data.error || 'Error al crear competencia');
      }
    } catch (error) {
      alert('Error al enviar la solicitud');
      console.error(error);
    }
  };

  const orgSeleccionada = organizaciones.find(o => o._id === form.organizacion);
  const nombreAutoGenerado = `${form.tipo} ${form.modalidad} ${form.categoria} ${form.temporada} ${orgSeleccionada?.nombre || ''}`;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Crear nueva competencia</h2>

      {/* Organización */}
      <select
        name="organizacion"
        value={form.organizacion}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Selecciona organización</option>
        {organizaciones.map(org => (
          <option key={org._id} value={org._id}>{org.nombre}</option>
        ))}
      </select>

      {/* Nombre Autogenerado */}
      {form.organizacion && (
        <p className="text-sm text-gray-500 italic">
          <span className="font-semibold">Nombre generado: </span>{nombreAutoGenerado}
        </p>
      )}

      {/* Descripción */}
      <textarea
        name="descripcion"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={handleChange}
        className="w-full h-24 px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Modalidad */}
      <div className="block text-gray-700">
        <span>Modalidad:</span>
        <div className="mt-1 flex flex-col sm:flex-row sm:gap-4 gap-2">
          {["Foam", "Cloth"].map((mod) => (
            <label key={mod} className="inline-flex items-center">
              <input
                type="radio"
                name="modalidad"
                value={mod}
                checked={form.modalidad === mod}
                onChange={handleChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">{mod}</span>
            </label>
          ))}
        </div>
      </div>


      {/* Categoría */}
      <div className="block text-gray-700">
        <span>Categoría:</span>
        <div className="mt-1 flex flex-col sm:flex-row sm:gap-4 gap-2">
          {["Masculino", "Femenino", "Mixto", "Libre"].map((cat) => (
            <label key={cat} className="inline-flex items-center">
              <input
                type="radio"
                name="categoria"
                value={cat}
                checked={form.categoria === cat}
                onChange={handleChange}
                className="form-radio text-purple-600"
              />
              <span className="ml-2">{cat}</span>
            </label>
          ))}
        </div>
      </div>


      {/* Tipo */}
      <div className="block text-gray-700">
        <span>Tipo de competencia:</span>
        <div className="mt-1 flex flex-col sm:flex-row sm:gap-4 gap-2">
          {["liga", "torneo", "otro"].map((tipo) => (
            <label key={tipo} className="inline-flex items-center">
              <input
                type="radio"
                name="tipo"
                value={tipo}
                checked={form.tipo === tipo}
                onChange={handleChange}
                className="form-radio text-green-600"
              />
              <span className="ml-2 capitalize">{tipo}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Temporada */}
      <input
        type="text"
        name="temporada"
        value={form.temporada}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Temporada (ej: 2025)"
      />

      {/* Fecha Inicio */}
      <input
        type="date"
        name="fechaInicio"
        value={form.fechaInicio}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* Reglas */}
      <textarea
        name="reglas"
        placeholder="Reglas (opcional)"
        value={form.reglas}
        onChange={handleChange}
        className="w-full h-24 px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Botón Crear */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-300"
      >
        Crear competencia
      </button>
    </form>
  );
}
