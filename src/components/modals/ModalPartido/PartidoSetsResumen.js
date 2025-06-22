import React, { useState } from 'react';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';

export default function PartidoSetsResumen({ sets, jugadores = [] }) {
  const [setSeleccionado, setSetSeleccionado] = useState('');

  const obtenerNombreJugador = (id) => {
    const jugador = jugadores.find(j => j._id === id);
    return jugador ? jugador.nombre : `ID: ${id}`;
  };

  const setActual = sets.find(s => s.numeroSet === Number(setSeleccionado));

  return (
    <section style={{ marginBottom: 20 }}>
      <h3>Estadísticas por Set</h3>

      {sets.length === 0 ? (
        <p>No hay sets cargados.</p>
      ) : (
        <>
          <SelectDropdown
            name="setSeleccionado"
            value={setSeleccionado}
            onChange={(e) => setSetSeleccionado(e.target.value)}
            options={sets.map(set => ({
              value: set.numeroSet,
              label: `Set ${set.numeroSet}`,
            }))}
            placeholder="Seleccionar set"
          />

          {setActual ? (
            <div style={styles.setBox}>
              <p>Marcador: {setActual.marcadorLocalSet} - {setActual.marcadorVisitanteSet}</p>
              <p>Estado: {setActual.estadoSet}</p>
              <p>Jugadores y estadísticas:</p>
              {setActual.statsJugadoresSet?.length > 0 ? (
                <ul>
                  {setActual.statsJugadoresSet.map((stat, idx) => (
                    <li key={idx}>
                      {typeof stat.jugador === 'object'
                        ? stat.jugador.alias || stat.jugador.nombre || 'Jugador desconocido'
                        : obtenerNombreJugador(stat.jugador)
                      } - Stats: {JSON.stringify(stat.estadisticas)}

                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay estadísticas cargadas.</p>
              )}
            </div>
          ) : (
            <p>Seleccioná un set para ver sus datos.</p>
          )}
        </>
      )}
    </section>
  );
}

const styles = {
  setBox: {
    marginTop: 15,
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
};
