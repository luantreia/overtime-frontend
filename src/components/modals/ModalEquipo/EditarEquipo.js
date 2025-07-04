import React, { useState } from 'react';
import InputText from '../../common/FormComponents/InputText';
import Button from '../../common/FormComponents/Button';

const tiposEquipo = ['club', 'seleccion', 'academia', 'otro'];

export default function EditarEquipo({ equipo, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: equipo?.nombre || '',
    escudo: equipo?.escudo || '',
    foto: equipo?.foto || '',
    tipo: equipo?.tipo || 'club',
    colores: equipo?.colores?.join(', ') || '',
    pais: equipo?.pais || '',
    esSeleccionNacional: equipo?.esSeleccionNacional || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      colores: formData.colores
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    };

    try {
      await onGuardar(payload); // delegamos al componente padre
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-[1200]"
      onClick={onCancelar}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-8 space-y-6"
      >
        <h3 className="text-2xl font-bold text-gray-800 text-center">Editar Equipo</h3>

        <div className="space-y-4">
          <InputText
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <InputText
            label="Escudo (URL o código bandera)"
            name="escudo"
            value={formData.escudo}
            onChange={handleChange}
          />
          <InputText
            label="Foto (URL)"
            name="foto"
            value={formData.foto}
            onChange={handleChange}
          />
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Tipo de equipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposEquipo.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <InputText
            label="Colores (separados por coma)"
            name="colores"
            value={formData.colores}
            onChange={handleChange}
            placeholder="#75AADB, #FFFFFF"
          />
          <InputText
            label="País (ISO 3166-1 alpha-3, ej: ARG)"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="esSeleccionNacional"
              name="esSeleccionNacional"
              checked={formData.esSeleccionNacional}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="esSeleccionNacional" className="text-gray-700 font-medium">
              ¿Es selección nacional?
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Guardar
          </Button>
          <Button
            type="button"
            onClick={onCancelar}
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
