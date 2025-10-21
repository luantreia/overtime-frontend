import React, { useState, useEffect, useMemo } from 'react';
import TarjetaEquipo from '../components/modals/ModalEquipo/tarjetaequipo.js';
import ModalEquipo from '../components/modals/ModalEquipo/ModalEquipo.js';
import TimelineEquipos from '../components/common/timeline/TimelineEquipos.js';
import { useEquipos } from '../hooks/equipos/useEquipos.js';
import { useAuth } from '../context/AuthContext.js';

const ITEMS_POR_PAGINA = 20;

export default function Equipos() {
  const { token } = useAuth();
  const { equipos, editar, loading, error } = useEquipos(token);

  // Debug logging
  console.log('🔍 Equipos Debug:', {
    token: token ? 'Presente' : 'Ausente',
    equiposLength: equipos?.length || 0,
    loading,
    error,
    equiposSample: equipos?.slice(0, 2) // Solo los primeros 2 para debug
  });

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [mostrarTimeline, setMostrarTimeline] = useState(false);
  const [orden, setOrden] = useState('aleatorio');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  // Función de diagnóstico para verificar conectividad
  const diagnosticarAPI = async () => {
    console.log('🔍 Iniciando diagnóstico de API de equipos...');

    try {
      // Verificar conectividad básica
      const testResponse = await fetch('https://overtime-ddyl.onrender.com/api/equipos', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log('📡 Respuesta de API:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries())
      });

      if (!testResponse.ok) {
        console.error('❌ Error HTTP:', testResponse.status);
        return;
      }

      const data = await testResponse.json();
      console.log('✅ Datos recibidos:', data.length, 'equipos');

      // Verificar estructura de datos
      if (data.length > 0) {
        console.log('📋 Estructura del primer equipo:', Object.keys(data[0]));
      }

    } catch (err) {
      console.error('❌ Error en diagnóstico:', err);
    }
  };

  // Ejecutar diagnóstico al montar
  useEffect(() => {
    diagnosticarAPI();
  }, [token]);
  const equiposFiltrados = useMemo(() => {
    if (filtroTipo === 'selecciones') {
      return equipos.filter(e => e.esSeleccionNacional);
    }
    if (filtroTipo === 'clubes') {
      return equipos.filter(e => !e.esSeleccionNacional);
    }
    return equipos;
  }, [equipos, filtroTipo]);

  // 🔢 Ordenar equipos
  const equiposOrdenados = useMemo(() => {
    const lista = [...equiposFiltrados];
    switch (orden) {
      case 'nombre_asc':
        return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  }, [equiposFiltrados, orden]);

  // 📄 Paginación
  const totalPaginas = Math.ceil(equiposOrdenados.length / ITEMS_POR_PAGINA);
  const equiposPagina = equiposOrdenados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const renderPaginacion = () => (
    <nav className="flex flex-wrap justify-center mt-6 gap-2">
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
        <button
          key={numero}
          onClick={() => setPaginaActual(numero)}
          disabled={numero === paginaActual}
          className={`px-3 py-1 rounded-lg border ${
            numero === paginaActual
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
          }`}
        >
          {numero}
        </button>
      ))}
    </nav>
  );

  const handleOrdenChange = (e) => {
    setOrden(e.target.value);
    setPaginaActual(1);
  };

  const handleFiltroChange = (e) => {
    setFiltroTipo(e.target.value);
    setPaginaActual(1);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Ordenar */}
        <div className="flex-1 min-w-0">
          <label htmlFor="orden" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Ordenar por:</label>
          <select
            id="orden"
            value={orden}
            onChange={handleOrdenChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="aleatorio">Aleatorio</option>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
          </select>
        </div>

        {/* Filtro tipo */}
        <div className="flex-1 min-w-0">
          <label htmlFor="filtroTipo" className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Filtrar por tipo:</label>
          <select
            id="filtroTipo"
            value={filtroTipo}
            onChange={handleFiltroChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="todos">Todos</option>
            <option value="selecciones">Selecciones Nacionales</option>
            <option value="clubes">Clubes / Otros</option>
          </select>
        </div>

        {/* Botón Timeline */}
        <div className="flex items-end sm:justify-end">
          <button
            onClick={() => setMostrarTimeline(true)}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="hidden sm:inline">📅 Ver Timeline Histórico</span>
            <span className="sm:hidden">📅 Timeline</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando equipos...</p>
          <p className="text-xs text-gray-500 mt-2">Verifica la consola para más detalles</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center mb-3">
            <div className="text-red-600 dark:text-red-400 text-xl mr-3">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error al cargar equipos</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <div className="text-sm text-red-600 dark:text-red-400 space-y-1">
            <p>• Verifica tu conexión a internet</p>
            <p>• Intenta refrescar la página</p>
            <p>• Si el problema persiste, contacta al administrador</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      )}

      {!loading && !error && equiposFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No hay equipos disponibles
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron equipos con los filtros aplicados.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 justify-items-center" aria-live="polite">
        {equiposPagina.map((equipo) => (
          <div key={equipo._id} className="w-full max-w-[140px]">
            <TarjetaEquipo
              nombre={equipo.nombre}
              escudo={equipo.escudo}
              onClick={() => setEquipoSeleccionado(equipo)}
            />
          </div>
        ))}
      </div>

      {renderPaginacion()}

      {equipoSeleccionado && (
        <ModalEquipo
          equipo={equipoSeleccionado}
          onClose={() => setEquipoSeleccionado(null)}
          onEditarEquipo={editar}
        />
      )}

      {mostrarTimeline && (
        <TimelineEquipos
          onClose={() => setMostrarTimeline(false)}
        />
      )}
    </div>
  );
}
