// src/components/users/AgregarJugadoresMultiple.js
import React, { useState, useEffect } from 'react';
import InputText from '../../common/FormComponents/InputText';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';
import Button from '../../common/FormComponents/Button';

export default function AgregarJugadoresMultiple() {
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([
    { nombre: '', posicion: '', equipoId: '', edad: '', foto: '' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('https://overtime-ddyl.onrender.com/api/equipos')
      .then(res => res.json())
      .then(setEquipos)
      .catch(err => console.error('Error al cargar equipos:', err));
  }, []);

  const handleChange = (index, field, value) => {
    setJugadores(js => {
      const copia = [...js];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  };

  const addRow = () => {
    setJugadores(js => [
      ...js,
      { nombre: '', posicion: '', equipoId: '', edad: '', foto: '' }
    ]);
  };

  const removeRow = index => {
    setJugadores(js => js.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const resultados = await Promise.all(
      jugadores.map(async jugador => {
        try {
          const res = await fetch('https://overtime-ddyl.onrender.com/api/jugadores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jugador),
          });
          const data = await res.json();
          return { success: res.ok, data };
        } catch (err) {
          return { success: false, error: err.message };
        }
      })
    );

    resultados.forEach((r, idx) => {
      if (r.success) {
        console.log(`Fila ${idx + 1}: OK`, r.data);
      } else {
        console.error(`Fila ${idx + 1}: ERROR`, r.error || r.data);
      }
    });

    alert('Proceso de carga finalizado; revisá consola para detalles.');
    setLoading(false);
  };

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit} className="form">
        <h2>Agregar Jugador</h2> 
        {jugadores.map((j, i) => (
          <div key={i} className="form-row">
            <InputText
              name={`nombre-${i}`}
              placeholder="Nombre"
              value={j.nombre}
              onChange={e => handleChange(i, 'nombre', e.target.value)}
            />
            <InputText
              name={`posicion-${i}`}
              placeholder="Posición"
              value={j.posicion}
              onChange={e => handleChange(i, 'posicion', e.target.value)}
            />
            <SelectDropdown
              name={`equipo-${i}`}
              value={j.equipoId}
              onChange={e => handleChange(i, 'equipoId', e.target.value)}
              options={equipos.map(eq => ({ value: eq._id, label: eq.nombre }))}
              placeholder="Equipo"
            />
            <InputText
              name={`edad-${i}`}
              type="number"
              placeholder="Edad"
              value={j.edad}
              onChange={e => handleChange(i, 'edad', e.target.value)}
            />
            <InputText
              name={`foto-${i}`}
              placeholder="URL Foto"
              value={j.foto}
              onChange={e => handleChange(i, 'foto', e.target.value)}
            />
            <Button
              type="button"
              variant="danger"
              onClick={() => removeRow(i)}
              disabled={loading || jugadores.length === 1}
            >
              ✖
            </Button>
          </div>
        ))}

        <div className="flex gap-4 mt-4">
          <Button
            type="button"
            variant="primary"
            onClick={addRow}
            disabled={loading}
          >
            + Agregar otro
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={loading}
          >
            {loading ? 'Agregando…' : 'Agregar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
