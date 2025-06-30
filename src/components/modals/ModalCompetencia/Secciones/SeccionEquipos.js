import React from 'react';
import { useEquipoCompetencia } from '../../../../hooks/useEquiposCompetencia';
import TarjetaEquipo from '../../ModalEquipo/tarjetaequipo';

function SeccionEquipos({ competenciaId }) {
  const { equiposCompetencia, loading, error } = useEquipoCompetencia(competenciaId);

  return (
    <section>
      <h3 className="text-xl font-semibold mb-3">Equipos</h3>

      {loading && <p>Cargando equipos...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {equiposCompetencia.length === 0 && !loading ? (
        <p>No hay equipos asignados.</p>
      ) : (
      <div className="lista px-0" aria-live="polite">        
          {equiposCompetencia.map(({ _id, equipo }) => (
            <TarjetaEquipo
              key={_id}
              nombre={equipo?.nombre || 'Equipo'}
              escudo={equipo?.escudo || ''}
              onClick={() => console.log('Clic en equipo:', equipo?.nombre)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default SeccionEquipos;
