import React from 'react';

function EstadisticasJugador({ jugadorPartidoId, estadisticas, onCambiarEstadistica, hayDatosAutomaticos }) {
  const [valoresTemporales, setValoresTemporales] = React.useState({
    throws: estadisticas.throws || 0,
    hits: estadisticas.hits || 0,
    outs: estadisticas.outs || 0,
    catches: estadisticas.catches || 0
  });

  // Actualizar valores temporales cuando cambien las estadísticas o el componente se monte
  React.useEffect(() => {
    console.log('📊 Inicializando valores para jugador:', jugadorPartidoId, estadisticas);
    setValoresTemporales({
      throws: estadisticas.throws || 0,
      hits: estadisticas.hits || 0,
      outs: estadisticas.outs || 0,
      catches: estadisticas.catches || 0
    });
  }, [jugadorPartidoId, estadisticas]);

  const handleInputChange = (campo, valor) => {
    const numValue = parseInt(valor) || 0;
    setValoresTemporales(prev => ({
      ...prev,
      [campo]: numValue
    }));
    onCambiarEstadistica(jugadorPartidoId, campo, numValue - (estadisticas[campo] || 0));
  };

  const handleIncrement = (campo, delta) => {
    const nuevoValor = Math.max(0, (estadisticas[campo] || 0) + delta);
    setValoresTemporales(prev => ({
      ...prev,
      [campo]: nuevoValor
    }));
    onCambiarEstadistica(jugadorPartidoId, campo, delta);
  };

  const esAutocompletado = hayDatosAutomaticos && estadisticas.fuente === 'autocompletado-automatico';

  return (
    <div className={`grid grid-cols-4 gap-2 text-xs ${esAutocompletado ? 'ring-1 ring-blue-200 rounded p-2 bg-blue-50/30' : ''}`}>
      {esAutocompletado && (
        <div className="col-span-4 text-center mb-1">
          <span className="text-xs text-blue-600 font-medium">💡 Autocompletado</span>
        </div>
      )}
      <div className="text-center">
        <div className="text-gray-600 mb-1">Throws</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleIncrement('throws', -1)}
            className="w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center hover:bg-red-600"
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={valoresTemporales.throws}
            onChange={(e) => handleInputChange('throws', e.target.value)}
            className="w-10 text-center border border-gray-300 rounded text-xs px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => handleIncrement('throws', 1)}
            className="w-6 h-6 bg-green-500 text-white rounded text-xs flex items-center justify-center hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-center">
        <div className="text-gray-600 mb-1">Hits</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleIncrement('hits', -1)}
            className="w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center hover:bg-red-600"
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={valoresTemporales.hits}
            onChange={(e) => handleInputChange('hits', e.target.value)}
            className="w-10 text-center border border-gray-300 rounded text-xs px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={() => handleIncrement('hits', 1)}
            className="w-6 h-6 bg-green-500 text-white rounded text-xs flex items-center justify-center hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-center">
        <div className="text-gray-600 mb-1">Outs</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleIncrement('outs', -1)}
            className="w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center hover:bg-red-600"
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={valoresTemporales.outs}
            onChange={(e) => handleInputChange('outs', e.target.value)}
            className="w-10 text-center border border-gray-300 rounded text-xs px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button
            onClick={() => handleIncrement('outs', 1)}
            className="w-6 h-6 bg-green-500 text-white rounded text-xs flex items-center justify-center hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-center">
        <div className="text-gray-600 mb-1">Catches</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => handleIncrement('catches', -1)}
            className="w-6 h-6 bg-red-500 text-white rounded text-xs flex items-center justify-center hover:bg-red-600"
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={valoresTemporales.catches}
            onChange={(e) => handleInputChange('catches', e.target.value)}
            className="w-10 text-center border border-gray-300 rounded text-xs px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <button
            onClick={() => handleIncrement('catches', 1)}
            className="w-6 h-6 bg-green-500 text-white rounded text-xs flex items-center justify-center hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstadisticasJugador;
