import React, { useEffect, useState, useCallback } from 'react';

export default function SeccionTablaFase({ fase, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!fase?._id || !token) return;
    setLoading(true);
    setError(null);
    try {
      const [resPart, resPartidos] = await Promise.all([
        fetch(`https://overtime-ddyl.onrender.com/api/participacion-fase?fase=${fase._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://overtime-ddyl.onrender.com/api/partidos?fase=${fase._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resPart.ok) throw new Error('Error al cargar participaciones');
      if (!resPartidos.ok) throw new Error('Error al cargar partidos');

      const [dataPart, dataPartidos] = await Promise.all([
        resPart.json(),
        resPartidos.json(),
      ]);

      setParticipaciones(dataPart);
      setPartidos(dataPartidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fase?._id, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const agruparYOrdenarParticipaciones = () => {
    const agrupados = {};
    participaciones.forEach((p) => {
      const grupo = p.grupo || p.division || 'General';
      agrupados[grupo] ??= [];
      agrupados[grupo].push(p);
    });

    for (const grupo in agrupados) {
      agrupados[grupo].sort((a, b) =>
        b.puntos - a.puntos ||
        b.diferenciaPuntos - a.diferenciaPuntos ||
        b.partidosGanados - a.partidosGanados
      );
    }

    return agrupados;
  };

  const ordenarPartidos = () => {
    const ordenEtapas = ['octavos', 'cuartos', 'semifinal', 'final'];
    return [...partidos].sort((a, b) => {
      const aEtapa = ordenEtapas.indexOf((a.etapa || '').toLowerCase());
      const bEtapa = ordenEtapas.indexOf((b.etapa || '').toLowerCase());
      return aEtapa - bEtapa || new Date(a.fecha) - new Date(b.fecha);
    });
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!fase) return <p>Fase no disponible</p>;

  if (['grupo', 'liga'].includes(fase.tipo)) {
    const tablas = agruparYOrdenarParticipaciones();

    return (
      <div>
        <h4 className="font-semibold mb-3">Tabla de Posiciones</h4>
        {Object.entries(tablas).map(([grupo, filas]) => (
          <div key={grupo} className="mb-6">
            <h5 className="font-semibold">{grupo}</h5>
            <table className="w-full table-auto border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th>Pos</th><th>Equipo</th><th>Pts</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>Dif</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((p, idx) => (
                  <tr key={p._id}>
                    <td>{idx + 1}</td>
                    <td>{p.participacionTemporada?.equipoCompetencia?.equipo?.nombre || 'Sin nombre'}</td>
                    <td>{p.puntos}</td>
                    <td>{p.partidosJugados}</td>
                    <td>{p.partidosGanados}</td>
                    <td>{p.partidosEmpatados}</td>
                    <td>{p.partidosPerdidos}</td>
                    <td>{p.diferenciaPuntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  if (['playoff', 'promocion'].includes(fase.tipo)) {
    const partidosOrdenados = ordenarPartidos();

    return (
      <div>
        <h4 className="font-semibold mb-3">Llaves del {fase.tipo}</h4>
        <table className="w-full table-auto border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th>Etapa</th><th>Fecha</th><th>Equipo A</th><th>Equipo B</th><th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {partidosOrdenados.map((p) => (
              <tr key={p._id}>
                <td>{p.etapa || '-'}</td>
                <td>{new Date(p.fecha).toLocaleDateString()}</td>
                <td>{p.equipoA?.nombre || '-'}</td>
                <td>{p.equipoB?.nombre || '-'}</td>
                <td>
                  {p.resultadoA != null && p.resultadoB != null
                    ? `${p.resultadoA} - ${p.resultadoB}`
                    : 'Pendiente'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p>Tipo de fase no soportado.</p>;
}
