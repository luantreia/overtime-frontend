import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import ModalEstadisticasCaptura from '../../../../modals/ModalEstadisticas/ModalEstadisticas';
import GraficoEstadisticasSet from './GraficoEstadisticasSet';
import EstadisticasGeneralesPartido from './EstadisticasGeneralesPartido';
import { obtenerSetsDePartido, agregarSet, actualizarSet, eliminarSet, editarPartido } from '../../../../../services/partidoService';

// Error Boundary temporal para debuggear
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-800 font-bold">Error en ModalEstadisticasCaptura:</h3>
          <details className="mt-2">
            <summary className="cursor-pointer text-red-600">Ver detalles del error</summary>
            <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ModalPartidoAdmin({ partidoId, token, onClose }) {
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalEstadisticasAbierto, setModalEstadisticasAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({});
  const [setsExpandidos, setSetsExpandidos] = useState({});
  const [vistaEstadisticas, setVistaEstadisticas] = useState('generales'); // 'generales' o 'setASet'

  useEffect(() => {
    if (!partidoId) return;
    fetchPartidoCompleto();
  }, [partidoId, token]);

  const fetchPartidoCompleto = async () => {
    setLoading(true);
    try {
      // Obtener datos del partido
      const resPartido = await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resPartido.ok) throw new Error('Error al cargar partido');
      const partidoData = await resPartido.json();

      // Obtener sets del partido
      const sets = await obtenerSetsDePartido(partidoId, token);
      
      setPartido({ ...partidoData, sets });
      setDatosEdicion({
        fecha: partidoData.fecha ? new Date(partidoData.fecha).toISOString().slice(0, 16) : '',
        ubicacion: partidoData.ubicacion || '',
        estado: partidoData.estado || 'programado',
        nombrePartido: partidoData.nombrePartido || ''
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarSet = async (partidoIdParam, setData) => {
    try {
      console.log('handleAgregarSet - partidoIdParam:', partidoIdParam);
      console.log('handleAgregarSet - partidoId:', partidoId);
      console.log('handleAgregarSet - setData:', setData);
      console.log('handleAgregarSet - token:', token ? 'presente' : 'ausente');
      
      // Usar el partidoId del parámetro o el del estado
      const idToUse = partidoIdParam || partidoId;
      const nuevoSet = await agregarSet(idToUse, setData, token);
      
      // Actualizar el estado del partido con el nuevo set
      setPartido(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sets: [...(prev.sets || []), nuevoSet]
        };
      });
      
      return nuevoSet;
    } catch (err) {
      console.error('Error agregando set:', err);
      throw err;
    }
  };

  const handleActualizarSet = async (numeroSet, setData) => {
    try {
      const setActualizado = await actualizarSet(partidoId, numeroSet, setData, token);
      setPartido(prev => ({

        ...prev,
        sets: prev.sets.map(s => 
          s.numeroSet === numeroSet ? { ...s, ...setData } : s
        )
      }));
      return setActualizado;
    } catch (err) {
      console.error('Error actualizando set:', err);
      throw err;
    }
  };

  const handleEliminarSet = async (numeroSet) => {
    try {
      await eliminarSet(partidoId, numeroSet, token);
      setPartido(prev => ({

        ...prev,
        sets: prev.sets.filter(s => s.numeroSet !== numeroSet)
      }));
      return true;
    } catch (err) {
      console.error('Error eliminando set:', err);
      throw err;
    }
  };

  const handleGuardarEdicion = async () => {
    try {
      const payload = {
        ...datosEdicion,
        fecha: datosEdicion.fecha ? new Date(datosEdicion.fecha) : null,
      };
      
      const partidoActualizado = await editarPartido(partidoId, payload, token);
      setPartido(prev => ({ ...prev, ...partidoActualizado }));
      setModoEdicion(false);
      alert('Partido actualizado correctamente');
    } catch (err) {
      alert('Error al actualizar partido: ' + err.message);
    }
  };

  const refrescarPartidoSeleccionado = async () => {
    await fetchPartidoCompleto();
    return partido;
  };

  const actualizarSetsLocalesCallback = useCallback((sets) => {
    setPartido(prev => prev ? { ...prev, sets } : null);
  }, []);

  if (loading) return <ModalBase title="Cargando partido..." onClose={onClose}><p>Cargando...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p className="text-red-600">{error}</p></ModalBase>;
  if (!partido) return null;

  return (
    <>
      <ModalBase title={`Administrar Partido`} onClose={onClose}>
        <div className="space-y-6">
          {/* Datos del partido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Información del Partido</h3>
            
            {modoEdicion ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del Partido</label>
                  <input
                    type="text"
                    value={datosEdicion.nombrePartido}
                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, nombrePartido: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={datosEdicion.fecha}
                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, fecha: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <input
                    type="text"
                    value={datosEdicion.ubicacion}
                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, ubicacion: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={datosEdicion.estado}
                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, estado: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="programado">Programado</option>
                    <option value="en_juego">En Juego</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGuardarEdicion}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setModoEdicion(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {partido.nombrePartido || 'Sin nombre'}</p>
                <p><strong>Fecha:</strong> {partido.fecha ? new Date(partido.fecha).toLocaleString() : '-'}</p>
                <p><strong>Competencia:</strong> {partido.competencia?.nombre || 'Partido amistoso'}</p>
                <p><strong>Estado:</strong> {partido.estado || '-'}</p>
                <p><strong>Ubicación:</strong> {partido.ubicacion || '-'}</p>
                <p><strong>Equipo Local:</strong> {partido.equipoLocal?.nombre || '-'}</p>
                <p><strong>Equipo Visitante:</strong> {partido.equipoVisitante?.nombre || '-'}</p>
                <button
                  onClick={() => setModoEdicion(true)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Editar Datos
                </button>
              </div>
            )}
          </div>

          {/* Estadísticas del partido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Estadísticas del Partido</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setVistaEstadisticas('generales')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    vistaEstadisticas === 'generales'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📊 Estadísticas Generales
                </button>
                <button
                  onClick={() => setVistaEstadisticas('setASet')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    vistaEstadisticas === 'setASet'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🎯 Set a Set
                </button>
              </div>
            </div>
            
            {/* Vista de Estadísticas Generales */}
            {vistaEstadisticas === 'generales' && (
              <EstadisticasGeneralesPartido partidoId={partidoId} token={token} />
            )}
            
            {/* Vista Set a Set */}
            {vistaEstadisticas === 'setASet' && (
              <div>
                {partido.sets && partido.sets.length > 0 ? (
                  <div className="space-y-3">
                    {partido.sets.map(set => {
                      const isExpanded = setsExpandidos[set._id];
                      
                      return (
                        <div key={set._id} className="bg-white rounded border">
                          {/* Header del set */}
                          <div 
                            className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSetsExpandidos(prev => ({
                              ...prev,
                              [set._id]: !prev[set._id]
                            }))}
                          >
                            <div className="flex items-center gap-2">
                              <svg 
                                className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="font-medium text-lg">Set {set.numeroSet}</span>
                              <span className="text-sm text-gray-600">
                                Estado: <span className="font-medium">{set.estadoSet}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Ganador: <span className="font-medium">{set.ganadorSet}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Estadísticas expandidas */}
                          {isExpanded && (
                            <div className="border-t px-3 pb-3">
                              <GraficoEstadisticasSet setId={set._id} token={token} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">No hay sets creados aún</p>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setModalEstadisticasAbierto(true)}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Gestionar Sets y Estadísticas
            </button>
            <button
              onClick={() => window.open(`/partidos/${partidoId}`, '_blank')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Ver Partido Completo
            </button>
          </div>
        </div>
      </ModalBase>

      {/* Modal de estadísticas */}
      {modalEstadisticasAbierto && partido && (
        <ErrorBoundary>
          <ModalEstadisticasCaptura
            partido={partido}
            partidoId={partidoId}
            token={token}
            onClose={() => setModalEstadisticasAbierto(false)}
            actualizarSetsLocales={actualizarSetsLocalesCallback}
            agregarSetAPartido={handleAgregarSet}
            eliminarSetDePartido={handleEliminarSet}
            cargarPartidoPorId={fetchPartidoCompleto}
            actualizarSetDePartido={handleActualizarSet}
            refrescarPartidoSeleccionado={refrescarPartidoSeleccionado}
          />
        </ErrorBoundary>
      )}
    </>
  );
}
