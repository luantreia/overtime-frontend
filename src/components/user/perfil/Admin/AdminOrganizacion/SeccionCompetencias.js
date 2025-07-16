import React, { useEffect, useState } from 'react';
import ModalCompetenciaAdmin from '../AdminCompetencia/ModalCompetenciaAdmin';
import FormularioCompetenciaSimple from './FormularioCompetenciaSimple';

export default function SeccionCompetencias({ organizacionId, token }) {
  const [competencias, setCompetencias] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);

  const cargarCompetencias = async () => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const filtradas = data.filter(c => c.organizacion?._id === organizacionId);
      setCompetencias(filtradas);
    } catch (err) {
      console.error('Error cargando competencias:', err);
    }
  };

  useEffect(() => {
    if (organizacionId) {
      cargarCompetencias();
    }
  }, [organizacionId]);

  const crearCompetencia = async () => {
    if (!nuevaNombre.trim()) return;

    try {
      setCargando(true);
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nuevaNombre,
          organizacion: organizacionId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }

      setNuevaNombre('');
      await cargarCompetencias();
    } catch (err) {
      console.error('Error creando competencia:', err);
    } finally {
      setCargando(false);
    }
  };

  const eliminarCompetencia = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta competencia?')) return;

    try {
      await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await cargarCompetencias();
    } catch (err) {
      console.error('Error al eliminar competencia:', err);
    }
  };

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Competencias</h3>

      <button
        onClick={() => setMostrarModalCrear(true)}
        className="btn btn-primary mb-4"
      >
        Crear competencia
      </button>


      {/* Lista de competencias */}
      {competencias.length === 0 ? (
        <p className="text-gray-600">No hay competencias asociadas.</p>
      ) : (
        <ul className="space-y-1">
          {competencias.map(c => (
            <li key={c._id} className="flex justify-between items-center border p-2 rounded">
              <span>{c.nombre}</span>
              <div className="flex gap-2">
                <button className="btn-secondary btn-sm" onClick={() => setSeleccionada(c)}>
                  Administrar
                </button>
                <button className="btn-error btn-sm" onClick={() => eliminarCompetencia(c._id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
  
{/* Modal de creación */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setMostrarModalCrear(false)}
            >
              ✕
            </button>
            <FormularioCompetenciaSimple
              organizacionId={organizacionId}
              token={token}
              onCreada={() => {
                setMostrarModalCrear(false);
                cargarCompetencias();
              }}
            />
            
          </div>
        </div>
      )}

      {/* Modal de administración */}
      {seleccionada && (
        <ModalCompetenciaAdmin
          competenciaId={seleccionada._id}
          token={token}
          onClose={() => {
            setSeleccionada(null);
            cargarCompetencias();
          }}
        />
      )}
    </section>
  );
}
