import React from 'react';
import TarjetaJugador from '../ModalJugador/tarjetajugador';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/FormComponents/Button';

export default function SeccionJugadores({ equipoId, setModalJugador, abrirAsignarJugadores }) {
  const { relaciones, loading } = useJugadorEquipo({ equipoId });
  const { user, rol } = useAuth();
  const uid = user?.uid;

  const equipo = relaciones[0]?.equipo; // asume que todas las relaciones son del mismo equipo
  const esAdminDelEquipo = equipo?.administradores?.includes(uid);
  const esAdminGlobal = rol === 'admin';

  return (
    <div style={styles.seccion}>
      <div style={styles.encabezado}>
      <h3>Jugadores asignados</h3>
      {(esAdminDelEquipo || esAdminGlobal) && (
          <Button onClick={abrirAsignarJugadores} color="primary">
          + Asignar jugadores
          </Button>
      )}
      </div>

      {loading ? (
        <p>Cargando jugadores...</p>
      ) : relaciones.length > 0 ? (
        <div style={styles.jugadoresGrid}>
          {relaciones.map((rel) => {
            const jugador = rel.jugador;
            if (!jugador) return null;

            return (
              <TarjetaJugador
                key={jugador._id}
                jugador={jugador}
                nombre={jugador.nombre}
                equipo={rel.equipo?.nombre}
                posicion={jugador.posicion}
                foto={jugador.foto}
                onClick={() => setModalJugador(jugador)}
              />
            );
          })}
        </div>
      ) : (
        <p>Sin jugadores asignados</p>
      )}
    </div>
  );
}


const styles = {
  
  encabezado: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    marginBottom: '15px',
  },
  seccion: {
    flex: '1 1 250px',
    backgroundColor: "var(--color-fondo-secundario)",
    padding: '10px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  jugadoresGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
  }
};
