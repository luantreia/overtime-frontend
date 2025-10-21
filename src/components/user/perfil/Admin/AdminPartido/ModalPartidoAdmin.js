import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import ModalEstadisticasCaptura from '../../../../modals/ModalEstadisticas/ModalEstadisticas';
import ModalEstadisticasGeneralesCaptura from '../../../../modals/ModalEstadisticas/ModalEstadisticasGeneralesCaptura';
import GraficoEstadisticasSet from './GraficoEstadisticasSet';
import EstadisticasGeneralesPartido from './EstadisticasGeneralesPartido';
import { SeccionEstadisticasGenerales } from './SeccionEstadisticasGenerales';
import { SeccionEstadisticasSetASet } from './SeccionEstadisticasSetASet';
import { SeccionEstadisticasDirectas } from './SeccionEstadisticasDirectas';
import { obtenerSetsDePartido, agregarSet, actualizarSet, eliminarSet, editarPartido, eliminarPartido } from '../../../../../services/partidoService';

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

export default function ModalPartidoAdmin({ partidoId, token, onClose, onPartidoEliminado }) {
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalEstadisticasAbierto, setModalEstadisticasAbierto] = useState(false);
  const [modalEstadisticasGeneralesAbierto, setModalEstadisticasGeneralesAbierto] = useState(null); // null, false, o {datosIniciales, hayDatosAutomaticos}
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({});
  const [vistaEstadisticas, setVistaEstadisticas] = useState('generales'); // 'generales', 'setASet', 'generalesDirectas'
  const [refreshEstadisticas, setRefreshEstadisticas] = useState(null);

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
        nombrePartido: partidoData.nombrePartido || '',
        marcadorLocal: partidoData.marcadorLocal || 0,
        marcadorVisitante: partidoData.marcadorVisitante || 0,
        marcadorModificadoManualmente: partidoData.marcadorModificadoManualmente ?? true
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
        marcadorModificadoManualmente: true, // Marcar como modificado manualmente
      };
      
      const partidoActualizado = await editarPartido(partidoId, payload, token);
      setPartido(prev => ({ ...prev, ...partidoActualizado }));
      setDatosEdicion(prev => ({ ...prev, marcadorModificadoManualmente: true }));
      setModoEdicion(false);
      alert('Partido actualizado correctamente');
    } catch (err) {
      alert('Error al actualizar partido: ' + err.message);
    }
  };

  const handleRecalcularMarcador = async () => {
    if (!window.confirm('¿Estás seguro de recalcular el marcador desde los sets? Esto reemplazará los marcadores actuales con el cálculo automático.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://overtime-ddyl.onrender.com/api/partidos/${partidoId}/recalcular-marcador`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al recalcular marcador');
      }

      const partidoActualizado = await response.json();
      setPartido(prev => ({ ...prev, ...partidoActualizado }));
      setDatosEdicion(prev => ({
        ...prev,
        marcadorLocal: partidoActualizado.marcadorLocal || 0,
        marcadorVisitante: partidoActualizado.marcadorVisitante || 0,
        marcadorModificadoManualmente: false
      }));
      alert('Marcador recalculado correctamente');
    } catch (error) {
      console.error('Error recalculando marcador:', error);
      alert('Error al recalcular marcador: ' + error.message);
    }
  };

  const handleEliminarPartido = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar este partido?\n\n${partido.nombrePartido || 'Partido sin nombre'}\n\nEsta acción no se puede deshacer y eliminará todos los sets y estadísticas asociadas.`)) {
      return;
    }

    // Confirmación adicional
    if (!window.confirm('¿Confirmas definitivamente que quieres ELIMINAR este partido?')) {
      return;
    }

    try {
      await eliminarPartido(partidoId, token);
      alert('Partido eliminado correctamente');
      onClose(); // Cerrar el modal
      // Llamar al callback opcional para refrescar la lista
      if (onPartidoEliminado) {
        onPartidoEliminado(partidoId);
      }
    } catch (error) {
      console.error('Error eliminando partido:', error);
      alert('Error al eliminar partido: ' + error.message);
    }
  };

  const handleCambiarModoEstadisticas = async (partidoId, nuevoModo) => {
    try {
      // Actualizar estado local inmediatamente para mejor UX
      setPartido(prev => ({ ...prev, modoEstadisticas: nuevoModo }));

      // Actualizar en el backend
      const response = await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ modoEstadisticas: nuevoModo })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar modo de estadísticas');
      }

      // No mostrar alertas que interrumpan la UX
      console.log(`Modo cambiado a ${nuevoModo === 'manual' ? 'Manual' : 'Automático'}`);
    } catch (error) {
      // Revertir cambio local si falló
      setPartido(prev => ({ ...prev, modoEstadisticas: prev.modoEstadisticas }));
      console.error('Error cambiando modo de estadísticas:', error);
      alert('Error al cambiar modo: ' + error.message);
    }
  };

  const handleCambiarModoVisualizacion = async (nuevoModo) => {
    try {
      // Actualizar estado local inmediatamente para mejor UX
      setPartido(prev => ({ ...prev, modoVisualizacion: nuevoModo }));

      // Actualizar en el backend
      const response = await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ modoVisualizacion: nuevoModo })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar modo de visualización');
      }

      // No mostrar alertas que interrumpan la UX
      console.log(`Modo de visualización cambiado a ${nuevoModo === 'manual' ? 'Manual' : 'Automático'}`);
    } catch (error) {
      // Revertir cambio local si falló
      setPartido(prev => ({ ...prev, modoVisualizacion: prev.modoVisualizacion }));
      console.error('Error cambiando modo de visualización:', error);
      alert('Error al cambiar modo de visualización: ' + error.message);
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marcador Local</label>
                    <input
                      type="number"
                      value={datosEdicion.marcadorLocal}
                      onChange={(e) => setDatosEdicion(prev => ({ ...prev, marcadorLocal: Number(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marcador Visitante</label>
                    <input
                      type="number"
                      value={datosEdicion.marcadorVisitante}
                      onChange={(e) => setDatosEdicion(prev => ({ ...prev, marcadorVisitante: Number(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min={0}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGuardarEdicion}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleRecalcularMarcador}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    title="Recalcular marcador automáticamente desde los sets"
                  >
                    🔄 Recalcular
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
                <p><strong>Marcador:</strong> {partido.equipoLocal?.nombre || 'Local'} {partido.marcadorLocal ?? 0} - {partido.marcadorVisitante ?? 0} {partido.equipoVisitante?.nombre || 'Visitante'}</p>
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
                  📊 Generales
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
                <button
                  onClick={() => setVistaEstadisticas('directas')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    vistaEstadisticas === 'directas'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ⚡ Directas
                </button>
              </div>
            </div>

            {/* Vista Estadísticas Generales */}
            {vistaEstadisticas === 'generales' && (
              <SeccionEstadisticasGenerales
                partido={partido}
                partidoId={partidoId}
                token={token}
                onCambiarModoEstadisticas={handleCambiarModoEstadisticas}
              />
            )}

            {/* Vista Set a Set */}
            {vistaEstadisticas === 'setASet' && (
              <SeccionEstadisticasSetASet
                partido={partido}
                token={token}
              />
            )}

            {/* Vista Estadísticas Directas */}
            {vistaEstadisticas === 'directas' && (
              <SeccionEstadisticasDirectas
                partido={partido}
                partidoId={partidoId}
                token={token}
                onRefresh={setRefreshEstadisticas}
                setModalEstadisticasGeneralesAbierto={setModalEstadisticasGeneralesAbierto}
              />
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

          {/* Sección de configuración avanzada */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-red-800 font-medium hover:text-red-900 transition-colors">
                <span className="flex items-center gap-2">
                  ⚙️ Configuración Avanzada
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                  </svg>
                </span>
              </summary>

              <div className="mt-4 pt-4 border-t border-red-200">
                {/* Selector de Modo de Visualización */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-blue-800 font-semibold mb-3">👁️ Configuración de Visualización</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Controla qué estadísticas ven los usuarios comunes del partido.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-700">Mostrar al público:</span>
                    <select
                      value={partido?.modoVisualizacion || 'automatico'}
                      onChange={(e) => handleCambiarModoVisualizacion(e.target.value)}
                      className="px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="automatico">📊 Estadísticas por Set (calculadas)</option>
                      <option value="manual">✏️ Estadísticas Totales (ingresadas)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <h4 className="text-red-800 font-semibold mb-3">⚠️ Acciones Irreversibles</h4>
                  <p className="text-red-700 text-sm mb-4">
                    Estas acciones eliminarán permanentemente datos del partido. No se pueden deshacer.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleEliminarPartido}
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                      title="Eliminar este partido permanentemente"
                    >
                      🗑️ Eliminar Partido
                    </button>
                  </div>
                </div>
              </div>
            </details>
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

      {/* Modal de estadísticas generales */}
      {modalEstadisticasGeneralesAbierto && (
        <ModalEstadisticasGeneralesCaptura
          partido={partido}
          partidoId={partidoId}
          token={token}
          onClose={() => setModalEstadisticasGeneralesAbierto(null)}
          onRefresh={refreshEstadisticas}
          datosIniciales={modalEstadisticasGeneralesAbierto?.datosIniciales || []}
          hayDatosAutomaticos={modalEstadisticasGeneralesAbierto?.hayDatosAutomaticos || false}
        />
      )}
    </>
  );
}
