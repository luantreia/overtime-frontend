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
      agrupados[grupo].sort((a, b) => {
        const puntosA = a.puntos ?? 0;
        const puntosB = b.puntos ?? 0;
        const difA = (a.diferenciaPuntos ?? ((a.puntosAFavor ?? a.gf ?? 0) - (a.puntosEnContra ?? a.gc ?? 0)));
        const difB = (b.diferenciaPuntos ?? ((b.puntosAFavor ?? b.gf ?? 0) - (b.puntosEnContra ?? b.gc ?? 0)));
        const ganA = a.partidosGanados ?? 0;
        const ganB = b.partidosGanados ?? 0;
        return (puntosB - puntosA) || (difB - difA) || (ganB - ganA);
      });
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
                    <td>{p.participacionTemporada?.equipo?.nombre || 'Sin nombre'}</td>
                    <td>{p.puntos ?? 0}</td>
                    <td>{p.partidosJugados ?? 0}</td>
                    <td>{p.partidosGanados ?? 0}</td>
                    <td>{p.partidosEmpatados ?? 0}</td>
                    <td>{p.partidosPerdidos ?? 0}</td>
                    <td>{(p.diferenciaPuntos ?? ((p.puntosAFavor ?? p.gf ?? 0) - (p.puntosEnContra ?? p.gc ?? 0)))}</td>
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
              <th>Etapa</th><th>Fecha</th><th>Local</th><th>Visitante</th><th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {partidosOrdenados.map((p) => (
              <tr key={p._id}>
                <td>{p.etapa || '-'}</td>
                <td>{new Date(p.fecha).toLocaleDateString()}</td>
                <td>{p.equipoLocal?.nombre || p.participacionFaseLocal?.participacionTemporada?.equipo?.nombre || '-'}</td>
                <td>{p.equipoVisitante?.nombre || p.participacionFaseVisitante?.participacionTemporada?.equipo?.nombre || '-'}</td>
                <td>
                  {(p.marcadorLocal != null && p.marcadorVisitante != null)
                    ? `${p.marcadorLocal} - ${p.marcadorVisitante}`
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
