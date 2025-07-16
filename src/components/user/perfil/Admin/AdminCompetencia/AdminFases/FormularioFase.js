import React, { useEffect } from 'react';

const TIPOS = ['grupo', 'liga', 'playoff', 'promocion', 'otro'];
const DIVISIONES = ['A', 'B', 'C'];

export default function FormularioFase({ form, onChange, fasesDisponibles}) {

  // Limpieza y ajustes al cambiar tipo
  useEffect(() => {
    // Al cambiar tipo, algunos campos no aplican, pueden limpiarse
    const camposParaLimpiar = {
      grupo: ['division', 'numeroAscensos', 'numeroDescensos', 'faseOrigenA', 'faseOrigenB'],
      liga: ['numeroClasificados', 'faseOrigenA', 'faseOrigenB'],
      playoff: ['division', 'numeroAscensos', 'numeroDescensos', 'numeroClasificados'],
      promocion: ['division', 'numeroAscensos', 'numeroDescensos', 'numeroClasificados'],
      otro: ['division', 'numeroAscensos', 'numeroDescensos', 'numeroClasificados', 'faseOrigenA', 'faseOrigenB']
    };

    const campos = camposParaLimpiar[form.tipo] || [];

    campos.forEach(campo => {
      if (form[campo]) {
        onChange({ target: { name: campo, value: '' } });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tipo]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          name="nombre"
          value={form.nombre || ''}
          onChange={onChange}
          className="input w-full"
          placeholder="Nombre de la fase"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Tipo</label>
        <select
          name="tipo"
          value={form.tipo || ''}
          onChange={onChange}
          className="input w-full"
          required
        >
          <option value="" disabled>Seleccione tipo</option>
          {TIPOS.map(tipo => (
            <option key={tipo} value={tipo}>
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium">Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={form.fechaInicio || ''}
            onChange={onChange}
            className="input w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={form.fechaFin || ''}
            onChange={onChange}
            className="input w-full"
          />
        </div>
      </div>

      {form.tipo === 'liga' && (
        <>
          <div>
            <label className="block text-sm font-medium">División</label>
            <select
              name="division"
              value={form.division || ''}
              onChange={onChange}
              className="input w-full"
              required
            >
              <option value="" disabled>Seleccione división</option>
              {DIVISIONES.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Número de ascensos</label>
            <input
              type="number"
              name="numeroAscensos"
              value={form.numeroAscensos || ''}
              onChange={onChange}
              className="input w-full"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Número de descensos</label>
            <input
              type="number"
              name="numeroDescensos"
              value={form.numeroDescensos || ''}
              onChange={onChange}
              className="input w-full"
              min="0"
              required
            />
          </div>
        </>
      )}

      {form.tipo === 'grupo' && (
        <div>
          <label className="block text-sm font-medium">Clasificados por grupo</label>
          <input
            type="number"
            name="numeroClasificados"
            value={form.numeroClasificados || ''}
            onChange={onChange}
            className="input w-full"
            min="0"
            required
          />
        </div>
      )}

      {(form.tipo === 'promocion' || form.tipo === 'playoff') && (
        <>
          <div>
            <label className="block text-sm font-medium">Fase Origen A</label>
            <select
              name="faseOrigenA"
              value={form.faseOrigenA || ''}
              onChange={onChange}
              className="input w-full"
            >
              <option value="">Seleccionar fase superior</option>
              {fasesDisponibles.map((fase) => (
                <option key={fase._id} value={fase._id}>
                  {fase.nombre} ({fase.tipo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Fase Origen B</label>
            <select
              name="faseOrigenB"
              value={form.faseOrigenB || ''}
              onChange={onChange}
              className="input w-full"
            >
              <option value="">Seleccionar fase inferior</option>
              {fasesDisponibles.map((fase) => (
                <option key={fase._id} value={fase._id}>
                  {fase.nombre} ({fase.tipo})
                </option>
              ))}
            </select>
          </div>
        </>
      )}

    </div>
  );
}
