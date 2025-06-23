import React, { useState } from 'react';

export default function PartidoSetsLineaDeTiempo({ sets = [], equipoLocal, equipoVisitante, jugadores = [] }) {
  const [setSeleccionado, setSetSeleccionado] = useState(null);

  const colorFondoSet = (set) => {
    if (set.ganadorSet === 'pendiente' || !set.ganadorSet) return '#eeeeee';
    if (String(set.ganadorSet) === String(equipoLocal._id)) return '#a5d6a7'; // verde
    if (String(set.ganadorSet) === String(equipoVisitante._id)) return '#ef9a9a'; // rojo
    return '#90caf9'; // azul (empate)
  };

  const obtenerNombreJugador = (id) => {
    const jugador = jugadores.find(j => j._id === id);
    return jugador ? jugador.alias || jugador.nombre : `ID: ${id}`;
  };

  const obtenerNombreEquipo = (id) => {
    if (String(id) === String(equipoLocal._id)) return equipoLocal.nombre;
    if (String(id) === String(equipoVisitante._id)) return equipoVisitante.nombre;
    return `Equipo ${id}`;
  };

  const agruparPorEquipo = (stats) => {
    const grupos = {
      [equipoLocal._id]: [],
      [equipoVisitante._id]: [],
    };
    for (const stat of stats || []) {
      const equipoId = stat.equipo?._id || stat.equipo;
      if (!grupos[equipoId]) grupos[equipoId] = [];
      grupos[equipoId].push(stat);
    }
    return grupos;
  };

  return (
    <section style={styles.wrapper}>
      <h3 style={{ marginBottom: 10 }}>Línea de tiempo de Sets</h3>

      <div style={styles.timeline}>
        {sets.map((set) => (
          <div
            key={set.numeroSet}
            onClick={() => setSetSeleccionado(set)}
            style={{
              ...styles.setBox,
              backgroundColor: colorFondoSet(set),
              flex: 1,
              maxWidth: `${100 / sets.length}%`,
              cursor: 'pointer',
              border: setSeleccionado?.numeroSet === set.numeroSet ? '2px solid #333' : 'none'
            }}
          >
            <strong>Set {set.numeroSet}</strong>
          </div>
        ))}
      </div>

      {setSeleccionado && (
        <div style={styles.detallesBox}>
          <h4>Set {setSeleccionado.numeroSet}</h4>
          <p><strong>Estado:</strong> {setSeleccionado.estadoSet || 'No definido'}</p>
          <p><strong>Ganador:</strong> {setSeleccionado.ganadorSet
            ? obtenerNombreEquipo(setSeleccionado.ganadorSet)
            : 'Pendiente'}</p>

          <div style={styles.estadisticasContainer}>
            {[equipoLocal, equipoVisitante].map((equipo) => {
              const stats = agruparPorEquipo(setSeleccionado.statsJugadoresSet)[equipo._id] || [];
              return (
                <div key={equipo._id} style={styles.equipoBox}>
                  <h5 style={styles.equipoTitulo}>{equipo.nombre}</h5>
                  <table style={styles.tabla}>
                    <thead>
                      <tr>
                        <th>Jugador</th>
                        <th>Throws</th>
                        <th>Hits</th>
                        <th>Outs</th>
                        <th>Catches</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.length > 0 ? stats.map((stat, idx) => (
                        <tr key={idx}>
                          <td>{typeof stat.jugador === 'object'
                            ? stat.jugador.alias || stat.jugador.nombre
                            : obtenerNombreJugador(stat.jugador)}</td>
                          <td>{stat.estadisticas?.throws ?? 0}</td>
                          <td>{stat.estadisticas?.hits ?? 0}</td>
                          <td>{stat.estadisticas?.outs ?? 0}</td>
                          <td>{stat.estadisticas?.catches ?? 0}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', fontStyle: 'italic' }}>Sin estadísticas</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

const styles = {
  wrapper: {
    marginBottom: 30,
    width: '100%',
  },
  timeline: {
    display: 'flex',
    gap: 10,
    width: '100%',
    marginBottom: 15,
  },
  setBox: {
    padding: '10px',
    borderRadius: 8,
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  detallesBox: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  estadisticasContainer: {
    display: 'flex',
    textAlign: 'center',    
    gap: 20,
    marginTop: 15,
    flexWrap: 'wrap',
  },
  equipoBox: {
    flex: '1 1 300px',
  },
  equipoTitulo: {
    marginBottom: 6,
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#eee',
  },
  td: {
    padding: '6px 8px',
    borderBottom: '1px solid #ccc',
  },
};
