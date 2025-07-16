import React, { useEffect, useState, useCallback } from 'react';
import ModalPartidoFaseAdmin from '../AdminPartidoFases/ModalPartidoAdmin';

export default function SeccionPartidosFase({ faseId, token }) {
  const [partidos, setPartidos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(false);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);

  const [form, setForm] = useState({
    fecha: '',
    ubicacion: '',
    participacionFaseLocal: '',
    participacionFaseVisitante: '',
    estado: 'programado',
  });

  const apiBasePartidos = 'https://overtime-ddyl.onrender.com/api/partidos';
  const apiBaseParticipacion = 'https://overtime-ddyl.onrender.com/api/participacion-fase';

  // Función para cargar partidos
  const cargarPartidos = useCallback(async () => {
    if (!faseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBasePartidos}?fase=${faseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar partidos');
      const data = await res.json();
      setPartidos(data);
    } catch (err) {
      setError(err.message);
      setPartidos([]);
    } finally {
      setLoading(false);
    }
  }, [faseId, token]);

  // Función para cargar participantes, con filtrado por grupo/división si existen
  const cargarParticipantes = useCallback(async () => {
    if (!faseId) return;
    try {
      const res = await fetch(`${apiBaseParticipacion}?fase=${faseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar participantes');
      let data = await res.json();

      // Filtrar según grupo o división si están presentes y son comunes
      const grupos = data.map((p) => p.grupo).filter(Boolean);
      const divisiones = data.map((p) => p.division).filter(Boolean);

      // Filtrar solo si todos tienen el mismo grupo o división (homogéneo)
      const grupoUnico = new Set(grupos).size === 1 ? grupos[0] : null;
      const divisionUnica = new Set(divisiones).size === 1 ? divisiones[0] : null;

      if (grupoUnico) data = data.filter((p) => p.grupo === grupoUnico);
      else if (divisionUnica) data = data.filter((p) => p.division === divisionUnica);

      setParticipantes(data);
    } catch (err) {
      console.error(err);
      setParticipantes([]);
    }
  }, [faseId, token]);

  useEffect(() => {
    cargarPartidos();
    cargarParticipantes();
  }, [faseId, cargarPartidos, cargarParticipantes]);

  // Manejo de formulario y estado
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const formatearFechaInput = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const abrirFormularioEdicion = (partido) => {
    setForm({
      fecha: formatearFechaInput(partido.fecha),
      ubicacion: partido.ubicacion || '',
      participacionFaseLocal: partido.participacionFaseLocal?._id || '',
      participacionFaseVisitante: partido.participacionFaseVisitante?._id || '',
      estado: partido.estado || 'programado',
    });
    setEditando(true);
    setPartidoSeleccionado(partido);
    setMostrarFormulario(true);
  };

  const abrirFormularioNuevo = () => {
    setForm({
      fecha: '',
      ubicacion: '',
      participacionFaseLocal: '',
      participacionFaseVisitante: '',
      estado: 'programado',
    });
    setEditando(false);
    setPartidoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const cancelar = () => {
    setMostrarFormulario(false);
    setEditando(false);
    setPartidoSeleccionado(null);
    setError(null);
  };

  const nombreEquipoDeParticipacion = (p) =>
    p?.participacionTemporada?.equipoCompetencia?.equipo?.nombre ||
    p?.equipo?.nombre ||
    'Equipo';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.participacionFaseLocal || !form.participacionFaseVisitante) {
      setError('Debes seleccionar ambos equipos');
      return;
    }
    if (form.participacionFaseLocal === form.participacionFaseVisitante) {
      setError('El equipo local y visitante no pueden ser el mismo');
      return;
    }
    if (!form.fecha) {
      setError('Debes seleccionar una fecha');
      return;
    }

    const payload = {
      ...form,
      fecha: new Date(form.fecha).toISOString(),
      fase: faseId,
    };

    try {
      setCargandoForm(true);
      const method = editando ? 'PUT' : 'POST';
      const url = editando ? `${apiBasePartidos}/${partidoSeleccionado._id}` : apiBasePartidos;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        console.log('Body que se envía:', payload);

        const errData = await res.json();
        throw new Error(errData.message || 'Error al guardar partido');
      }
      await cargarPartidos();
      cancelar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  // Eliminar partido
  const eliminarPartido = async (id) => {
    if (!window.confirm('¿Querés eliminar este partido?')) return;

    try {
      const res = await fetch(`${apiBasePartidos}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al eliminar partido');
      }
      await cargarPartidos();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p>Cargando partidos...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Partidos de la Fase</h3>

      {!mostrarFormulario && (
        <button className="btn btn-primary mb-4" onClick={abrirFormularioNuevo}>
          Crear partido
        </button>
      )}

      {partidos.length === 0 && <p>No hay partidos registrados.</p>}

      <ul className="mb-6">
        {partidos.map((p) => (
          <li
            key={p._id}
            className="border rounded p-2 mb-2 flex justify-between items-center"
          >
            <div>
              <strong>{p.equipoLocal?.nombre || 'Local'}</strong> vs{' '}
              <strong>{p.equipoVisitante?.nombre || 'Visitante'}</strong> <br />
              <small className="text-gray-600 text-sm">
                {p.grupo && `Grupo ${p.grupo} · `}
                {p.division && `División ${p.division} · `}
                {p.etapa && `${p.etapa} · `}
                {new Date(p.fecha).toLocaleString()}
              </small>
              <div className="text-sm">Marcador: {p.marcadorLocal} - {p.marcadorVisitante}</div>
              <div className="text-sm text-gray-600">Estado: {p.estado}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-accent" onClick={() => abrirFormularioEdicion(p)}>
                Editar
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={() => eliminarPartido(p._id)}
                title="Eliminar partido"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

    {mostrarFormulario && (
    <ModalPartidoFaseAdmin
        partido={partidoSeleccionado}
        faseId={faseId}
        token={token}
        participantes={participantes}
        onGuardar={cargarPartidos}
        onCerrar={cancelar}
    />
    )}
    </section>
  );
}
