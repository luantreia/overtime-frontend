import React, { useState, useEffect, useMemo, useRef } from 'react';
import ModalLayout from '../ModalLayout';
import { useAuth } from '../../../context/AuthContext.js';
import { fetchEquiposCompetenciaPorEquipo } from '../../../services/equipoService.js';
import { fetchPartidosPorEquipo } from '../../../services/partidoService.js';

const VIEW_WIDTH = 2000;
const X_START = 50;
const X_END = VIEW_WIDTH - 50;
const TIME_AXIS_WIDTH = X_END - X_START;
const TEAM_ROW_HEIGHT = 40;
const PADDING_Y = 20;
const REGION_TITLE_EXTRA = 50;

export default function TimelineEquipos({ onClose }) {
  const { token } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [hoveredEquipo, setHoveredEquipo] = useState(null);
  const [filtroAnio, setFiltroAnio] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');
  const timelineRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const zoomMin = 0.5;
  const zoomMax = 4;
  const zoomStep = 0.25;
  const [pivotX, setPivotX] = useState(X_START);
  const [soloActivos, setSoloActivos] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState(0);
  const [panScrollLeft, setPanScrollLeft] = useState(0);
  const [isSmall, setIsSmall] = useState(false);
  const initializedZoomRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e) => setIsSmall(e.matches);
    setIsSmall(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const cargarEquiposTimeline = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://overtime-ddyl.onrender.com/api/equipos', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Error al cargar equipos');
        }

        const data = await response.json();

        // Procesar equipos con sus fechas y estadísticas
        const equiposConDatos = await Promise.all(
          data.map(async (equipo) => {
            try {
              // Obtener estadísticas básicas del equipo
              const [partidos, competencias] = await Promise.all([
                fetchPartidosPorEquipo(equipo._id, token),
                fetchEquiposCompetenciaPorEquipo(equipo._id, token)
              ]);

              // Calcular estadísticas
              const totalPartidos = partidos.length;
              const partidosGanados = partidos.filter(p => p.ganador === equipo._id).length;
              const partidosPerdidos = totalPartidos - partidosGanados;
              const totalCompetencias = competencias.length;

              // Determinar si el equipo está activo
              // Un equipo se considera activo si:
              // 1. Tuvo partidos en los últimos 6 meses, O
              // 2. Participó en competiciones en los últimos 6 meses, O
              // 3. Es muy nuevo (menos de 6 meses) y aún no tiene partidos
              const fechaActual = new Date();
              const fechaLimiteActividad = new Date();
              fechaLimiteActividad.setMonth(fechaLimiteActividad.getMonth() - 6); // 6 meses atrás

              const fechaFormacionEq = equipo.fechaFormacion ? new Date(equipo.fechaFormacion) : null;
              const fechaDisolucionEq = equipo.fechaDisolucion ? new Date(equipo.fechaDisolucion) : null;
              const diasDesdeCreacion = fechaFormacionEq ? ((fechaActual - fechaFormacionEq) / (1000 * 60 * 60 * 24)) : 0;

              let estaActivo = true;
              if (fechaDisolucionEq && fechaDisolucionEq <= fechaActual) {
                estaActivo = false;
              }

              return {
                ...equipo,
                fechaCreacion: (fechaFormacionEq && !isNaN(fechaFormacionEq)) ? fechaFormacionEq : null,
                estadisticas: {
                  totalPartidos,
                  partidosGanados,
                  partidosPerdidos,
                  totalCompetencias,
                  ratioVictoria: totalPartidos > 0 ? (partidosGanados / totalPartidos * 100).toFixed(1) : 0
                },
                estaActivo,
                fechaDisolucion: fechaDisolucionEq
              };
            } catch (error) {
              console.error(`Error procesando equipo ${equipo.nombre}:`, error);
              return {
                ...equipo,
                fechaCreacion: equipo.fechaFormacion ? new Date(equipo.fechaFormacion) : null,
                estadisticas: {
                  totalPartidos: 0,
                  partidosGanados: 0,
                  partidosPerdidos: 0,
                  totalCompetencias: 0,
                  ratioVictoria: 0
                },
                estaActivo: !equipo.fechaDisolucion,
                fechaDisolucion: equipo.fechaDisolucion ? new Date(equipo.fechaDisolucion) : null
              };
            }
          })
        );

        const equiposValidos = equiposConDatos.filter(e => e.fechaCreacion);
        setEquipos(equiposValidos);
        setError(null);
      } catch (err) {
        console.error('Error cargando timeline:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarEquiposTimeline();
  }, [token]);

  useEffect(() => {
    try {
      const z = parseFloat(localStorage.getItem('timelineZoom'));
      if (!isNaN(z)) setZoom(Math.max(zoomMin, Math.min(zoomMax, z)));
      const px = parseFloat(localStorage.getItem('timelinePivotX'));
      if (!isNaN(px)) setPivotX(px);
      const sa = localStorage.getItem('timelineSoloActivos');
      if (sa === 'true' || sa === 'false') setSoloActivos(sa === 'true');
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (initializedZoomRef.current) return;
    try {
      const hasStored = localStorage.getItem('timelineZoom');
      if (!hasStored && isSmall) {
        setPivotX(X_START);
        setZoom(2.5);
      }
    } catch (_) {}
    initializedZoomRef.current = true;
  }, [isSmall]);

  useEffect(() => { try { localStorage.setItem('timelineZoom', String(zoom)); } catch (_) {} }, [zoom]);
  useEffect(() => { try { localStorage.setItem('timelinePivotX', String(pivotX)); } catch (_) {} }, [pivotX]);
  useEffect(() => { try { localStorage.setItem('timelineSoloActivos', String(soloActivos)); } catch (_) {} }, [soloActivos]);

  const handleZoomIn = () => setZoom(z => Math.min(zoomMax, parseFloat((z + zoomStep).toFixed(2))))
  const handleZoomOut = () => setZoom(z => Math.max(zoomMin, parseFloat((z - zoomStep).toFixed(2))))
  const handleResetZoom = () => setZoom(1)
  const handleFitToContent = () => {
    const container = timelineRef.current;
    if (!container) return;
    const width = container.clientWidth || VIEW_WIDTH;
    const factor = width / TIME_AXIS_WIDTH;
    setPivotX(X_START);
    setZoom(Math.max(zoomMin, Math.min(zoomMax, parseFloat(factor.toFixed(2)))));
  }

  const handleWheel = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    setPivotX(mouseX);
    if (e.deltaY < 0) {
      handleZoomIn();
    } else if (e.deltaY > 0) {
      handleZoomOut();
    }
  }

  const handleDoubleClick = (e) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    setPivotX(mouseX);
    if (e.shiftKey) {
      handleZoomOut();
    } else {
      handleZoomIn();
    }
  }

  // Filtrar equipos
  const rowHeight = isSmall ? 28 : TEAM_ROW_HEIGHT;
  const paddingYResponsive = isSmall ? 12 : PADDING_Y;

  const equiposFiltrados = useMemo(() => {
    let filtered = [...equipos];
    
    // Filtrar por tipo (selecciones/clubes)
    if (filtroTipo === 'selecciones') {
      filtered = filtered.filter(e => e.esSeleccionNacional);
    } else if (filtroTipo === 'clubes') {
      filtered = filtered.filter(e => !e.esSeleccionNacional);
    }

    if (soloActivos) {
      filtered = filtered.filter(e => e.estaActivo);
    }

    // Filtrar por año
    if (filtroAnio !== 'todos') {
      filtered = filtered.filter(equipo => {
        const fechaCreacion = new Date(equipo.fechaCreacion);
        const fechaFin = equipo.fechaDisolucion ? new Date(equipo.fechaDisolucion) : new Date();
        return fechaCreacion.getFullYear() <= parseInt(filtroAnio) && 
               (fechaFin.getFullYear() >= parseInt(filtroAnio) || equipo.estaActivo);
      });
    }

    // Filtrar por mes (solo si hay un año seleccionado)
    if (filtroMes !== 'todos' && filtroAnio !== 'todos') {
      filtered = filtered.filter(equipo => {
        const fechaCreacion = new Date(equipo.fechaCreacion);
        const fechaFin = equipo.ultimoPartido ? new Date(equipo.ultimoPartido) : new Date();
        
        // Verificar si el equipo existió en el mes/año seleccionado
        const fechaInicioFiltro = new Date(parseInt(filtroAnio), parseInt(filtroMes) - 1, 1);
        const fechaFinFiltro = new Date(parseInt(filtroAnio), parseInt(filtroMes), 0);
        
        return (fechaCreacion <= fechaFinFiltro) && 
               (fechaFin >= fechaInicioFiltro || equipo.estaActivo);
      });
    }

    return filtered;
  }, [equipos, filtroTipo, filtroAnio, filtroMes]);

  // Obtener años únicos para el filtro
  const aniosUnicos = useMemo(() => {
    const anios = new Set();
    equipos.forEach(equipo => {
      const fecha = new Date(equipo.fechaCreacion);
      anios.add(fecha.getFullYear());
      
      if (equipo.ultimoPartido) {
        const fechaFin = new Date(equipo.ultimoPartido);
        anios.add(fechaFin.getFullYear());
      }
    });
    return Array.from(anios).sort((a, b) => b - a); // Orden descendente
  }, [equipos]);

  const meses = [
    { valor: '1', nombre: 'Enero' },
    { valor: '2', nombre: 'Febrero' },
    { valor: '3', nombre: 'Marzo' },
    { valor: '4', nombre: 'Abril' },
    { valor: '5', nombre: 'Mayo' },
    { valor: '6', nombre: 'Junio' },
    { valor: '7', nombre: 'Julio' },
    { valor: '8', nombre: 'Agosto' },
    { valor: '9', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' }
  ];

  const timelineData = useMemo(() => {
    if (equiposFiltrados.length === 0) return { minDate: null, maxDate: null, regiones: [], eventos: [] };

    // Usar el rango de fechas seleccionado o el rango completo
    let minDate, maxDate;
    
    if (filtroAnio !== 'todos') {
      minDate = new Date(parseInt(filtroAnio), filtroMes !== 'todos' ? parseInt(filtroMes) - 1 : 0, 1);
      maxDate = new Date(parseInt(filtroAnio), filtroMes !== 'todos' ? parseInt(filtroMes) : 11, filtroMes !== 'todos' ? 0 : 31);
      maxDate.setHours(23, 59, 59, 999);
    } else {
      // Si no hay filtro de año, usar el rango completo de fechas
      const fechas = equiposFiltrados.flatMap(e => [
        e.fechaCreacion,
        e.fechaDisolucion || new Date()
      ]);
      minDate = new Date(Math.min(...fechas));
      maxDate = new Date(Math.max(...fechas));
    }

    // Extender el rango para mejor visualización
    const rangeStart = new Date(minDate);
    rangeStart.setMonth(rangeStart.getMonth() - 1);
    const rangeEnd = new Date(maxDate);
    rangeEnd.setMonth(rangeEnd.getMonth() + 1);

    // Organizar por "regiones" (selecciones y clubes)
    const regiones = [
      { nombre: "Selecciones Nacionales", color: "#2563EB", equipos: [], y: 0 },
      { nombre: "Clubes y Equipos", color: "#16A34A", equipos: [], y: 0 }
    ];

    // Clasificar equipos por región
    equiposFiltrados.forEach((equipo) => {
      const regionIndex = equipo.esSeleccionNacional ? 0 : 1;
      regiones[regionIndex].equipos.push(equipo);
    });

    // Calcular posiciones para cada región y equipo
    const eventos = [];
    const regionHeight = 100; // Altura de cada región
    const teamRowHeight = rowHeight; // Altura de cada fila de equipo
    const paddingY = paddingYResponsive; // Espaciado vertical
    
    // Calcular posición Y para cada región
    let currentY = paddingY;
    regiones.forEach(region => {
      if (region.equipos.length > 0) {
        region.y = currentY;
        currentY += (region.equipos.length * teamRowHeight) + paddingY + 50; // +50 para el título de la región
      }
    });

    // Procesar equipos para cada región
    regiones.forEach((region) => {
      if (region.equipos.length === 0) return;
      
      // Ordenar equipos por fecha de creación
      region.equipos.sort((a, b) => a.fechaCreacion - b.fechaCreacion);
      
      // Procesar cada equipo en la región
      region.equipos.forEach((equipo, equipoIndex) => {
        const startDate = new Date(equipo.fechaCreacion);
        const endDate = equipo.fechaDisolucion ? new Date(equipo.fechaDisolucion) : new Date();
        
        // Calcular posición X y ancho del tile
        const totalDuration = rangeEnd - rangeStart;
        const startPos = (startDate - rangeStart) / totalDuration;
        const endPos = (endDate - rangeStart) / totalDuration;
        
        const startX = X_START + (startPos * TIME_AXIS_WIDTH);
        const width = Math.max(5, (endPos - startPos) * TIME_AXIS_WIDTH);
        
        // Posición Y basada en el índice del equipo
        const y = region.y + 50 + (equipoIndex * teamRowHeight);
        
        eventos.push({
          id: equipo._id,
          nombre: equipo.nombre,
          fecha: startDate,
          fechaFin: endDate,
          tipo: equipo.esSeleccionNacional ? 'seleccion' : 'club',
          pais: equipo.pais,
          estadisticas: equipo.estadisticas,
          escudo: equipo.escudo,
          estaActivo: equipo.estaActivo,
          ultimoPartido: equipo.ultimoPartido,
          fechaDisolucion: equipo.fechaDisolucion,
          region: region.nombre,
          regionIndex: region.equipos[0].esSeleccionNacional ? 0 : 1,
          equipoIndex: equipoIndex,
          x: startX,
          y: y,
          width: width,
          height: teamRowHeight - 5, // Espacio entre filas
          color: equipo.esSeleccionNacional ? '#2563EB' : '#16A34A',
          opacity: equipo.estaActivo ? 1 : 0.7
        });
      });
    });

    return { minDate: rangeStart, maxDate: rangeEnd, regiones, eventos };
  }, [equiposFiltrados]);

  const zoomTransform = `translate(${pivotX},0) scale(${zoom},1) translate(${-pivotX},0)`;

  const handlePanMouseDown = (e) => {
    if (!timelineRef.current) return;
    setIsPanning(true);
    setPanStartX(e.clientX);
    setPanScrollLeft(timelineRef.current.scrollLeft);
  };

  const handlePanMouseMove = (e) => {
    if (!isPanning || !timelineRef.current) return;
    const dx = e.clientX - panStartX;
    timelineRef.current.scrollLeft = panScrollLeft - dx;
  };

  const handlePanMouseUp = () => setIsPanning(false);

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ModalLayout onClose={onClose} maxWidth="max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando línea temporal de equipos...</p>
        </div>
      </ModalLayout>
    );
  }

  if (error) {
    return (
      <ModalLayout onClose={onClose} maxWidth="max-w-6xl">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </ModalLayout>
    );
  }

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-7xl" className="max-h-[95vh]">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 flex-shrink-0 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">⏰ Timeline Histórico de Equipos</h2>
            <p className="text-blue-100 mb-4 text-sm sm:text-base">Evolución cronológica del dodgeball</p>

            {/* Leyenda visual mejorada - responsive */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2 bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full border border-white"></div>
                <span>Selecciones</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full border border-white"></div>
                <span>Clubes</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span>Activos</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white bg-opacity-20 rounded-full px-2 sm:px-3 py-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 border border-gray-300 rounded-full bg-white"></div>
                <span>Inactivos</span>
              </div>
            </div>

            <div className="mt-3 text-blue-100 text-xs sm:text-sm">
              {equiposFiltrados.length} equipos • {timelineData.minDate ? formatearFecha(timelineData.minDate) : '...'} → {timelineData.maxDate ? formatearFecha(timelineData.maxDate) : '...'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl sm:text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all ml-2 sm:ml-4"
          >
            ×
          </button>
          <div className="ml-2 sm:ml-4 flex flex-col items-end gap-2">
            <div className="inline-flex items-center bg-white bg-opacity-20 rounded-lg overflow-hidden">
              <button onClick={handleZoomOut} className="px-2 py-1 hover:bg-white hover:bg-opacity-20">−</button>
              <div className="px-2 py-1 text-xs">{Math.round(zoom * 100)}%</div>
              <button onClick={handleZoomIn} className="px-2 py-1 hover:bg-white hover:bg-opacity-20">+</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleResetZoom} className="text-xs bg-white bg-opacity-10 hover:bg-opacity-20 rounded px-2 py-1">Reset</button>
              <button onClick={handleFitToContent} className="text-xs bg-white bg-opacity-10 hover:bg-opacity-20 rounded px-2 py-1">Fit</button>
            </div>
          </div>
        </div>

          {/* Controles de filtro mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <label className="block text-xs font-medium text-blue-100 mb-1">Tipo de equipo:</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full text-sm bg-white text-gray-800 rounded px-3 py-2 border-0 focus:ring-2 focus:ring-blue-300"
              >
                <option value="todos">🌍 Todos los equipos</option>
                <option value="selecciones">🏆 Selecciones</option>
                <option value="clubes">🏟️ Clubes</option>
              </select>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <label className="block text-xs font-medium text-blue-100 mb-1">Estado:</label>
              <label className="inline-flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />
                <span>Solo activos</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFiltroTipo('todos');
                  setFiltroAnio('todos');
                  setFiltroMes('todos');
                  setSoloActivos(false);
                }}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                🔄 Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Container mejorado */}
        <div className="flex-1 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
          <div
            ref={timelineRef}
            className={`h-full overflow-x-auto overflow-y-auto p-8 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handlePanMouseDown}
            onMouseMove={handlePanMouseMove}
            onMouseUp={handlePanMouseUp}
            onMouseLeave={handlePanMouseUp}
          >
            {/* Timeline SVG inspirado en ObservableHQ */}
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${VIEW_WIDTH} ${Math.max(1000, timelineData.regiones.reduce((acc, r) => 
                Math.max(acc, r.y + (r.equipos?.length * TEAM_ROW_HEIGHT) + PADDING_Y + REGION_TITLE_EXTRA), 0))}`}
              className="w-full h-full"
              preserveAspectRatio="xMinYMin meet"
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            >
              <g transform={zoomTransform}>
              {/* Eje de tiempo en la parte superior */}
              <line
                x1={X_START}
                y1="30"
                x2={X_END}
                y2="30"
                stroke="#4B5563"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Marcas de tiempo */}
              {(() => {
                const startYear = timelineData.minDate ? timelineData.minDate.getFullYear() : new Date().getFullYear() - 5;
                const endYear = timelineData.maxDate ? timelineData.maxDate.getFullYear() : new Date().getFullYear() + 1;
                const years = [];
                for (let year = startYear; year <= endYear; year++) {
                  years.push(year);
                }
                
                return years.map((year, i) => {
                  const span = Math.max(1, endYear - startYear);
                  const x = X_START + ((year - startYear) / span) * TIME_AXIS_WIDTH;
                  return (
                    <g key={`year-${year}`}>
                      <line
                        x1={x}
                        y1="25"
                        x2={x}
                        y2="35"
                        stroke="#4B5563"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y="20"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {year}
                      </text>
                    </g>
                  );
                });
              })()}

              {/* Regiones y equipos */}
              {timelineData.regiones.filter(r => r.equipos?.length > 0).map((region, index) => (
                <g key={`region-${index}`}>
                  {/* Título de la región */}
                  <rect
                    x="30"
                    y={region.y - 30}
                    width="200"
                    height="30"
                    rx="15"
                    fill={region.color}
                    opacity="0.9"
                  />
                  <text
                    x="130"
                    y={region.y - 10}
                    textAnchor="middle"
                    className="text-sm font-bold fill-white"
                  >
                    {region.nombre} ({region.equipos.length})
                  </text>

                  {/* Línea de tiempo de la región */}
                  <line
                    x1={X_START}
                    y1={region.y}
                    x2={X_END}
                    y2={region.y}
                    stroke={region.color}
                    strokeWidth="2"
                    opacity="0.3"
                  />
                </g>
              ))}

              {/* Tiles de equipos */}
              {timelineData.eventos.map((equipo, index) => {
                // Calcular posición y tamaño del tile
                const startX = equipo.x;
                const endX = startX + equipo.width;
                const y = equipo.y;
                const height = equipo.height;
                const isHovered = hoveredEquipo?.id === equipo.id;
                
                return (
                  <g key={`tile-${equipo.id}-${index}`}>
                    {/* Fondo del tile */}
                    <rect
                      x={startX}
                      y={y - height / 2}
                      width={Math.max(5, equipo.width)}
                      height={height}
                      rx="4"
                      fill={equipo.color}
                      opacity={isHovered ? 1 : equipo.opacity}
                      className="cursor-pointer transition-all duration-200 hover:opacity-100"
                      onMouseEnter={() => setHoveredEquipo(equipo)}
                      onMouseLeave={() => setHoveredEquipo(null)}
                    />
                    
                    {/* Indicador de equipo activo */}
                    {equipo.estaActivo && (
                      <rect
                        x={endX - 8}
                        y={y - 4}
                        width="8"
                        height="8"
                        rx="4"
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    )}
                    
                    {/* Nombre del equipo (solo si hay espacio suficiente) */}
                    {equipo.width > 100 && (
                      <text
                        x={startX + 8}
                        y={y + 4}
                        className="text-xs font-medium fill-white pointer-events-none"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        {equipo.nombre}
                      </text>
                    )}
                    
                    {/* Indicador de disolución */}
                    {equipo.fechaDisolucion && (
                      <line
                        x1={endX}
                        y1={y - 6}
                        x2={endX}
                        y2={y + 6}
                        stroke="#EF4444"
                        strokeWidth="2"
                        pointerEvents="none"
                      />
                    )}

                    {/* Indicador de hover */}
                    {isHovered && (
                      <>
                        <rect
                          x={startX}
                          y={y - height / 2 - 5}
                          width={Math.max(5, equipo.width)}
                          height={height + 10}
                          rx="4"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeDasharray="3,3"
                          pointerEvents="none"
                        />
                        <circle
                          cx={startX}
                          cy={y}
                          r="4"
                          fill="white"
                          stroke={equipo.color}
                          strokeWidth="2"
                          pointerEvents="none"
                        />
                        {equipo.fechaDisolucion && (
                          <circle
                            cx={endX}
                            cy={y}
                            r="4"
                            fill="white"
                            stroke="#EF4444"
                            strokeWidth="2"
                            pointerEvents="none"
                          />
                        )}
                      </>
                    )}
                  </g>
                );
              })}
              
              {/* Línea del tiempo actual */}
              {filtroAnio === 'todos' && (
                <line
                  x1={X_START + ((new Date() - timelineData.minDate) / Math.max(1, (timelineData.maxDate - timelineData.minDate))) * TIME_AXIS_WIDTH}
                  y1="30"
                  x2={X_START + ((new Date() - timelineData.minDate) / Math.max(1, (timelineData.maxDate - timelineData.minDate))) * TIME_AXIS_WIDTH}
                  y2={Math.max(1000, timelineData.regiones.reduce((acc, r) => 
                    Math.max(acc, r.y + (r.equipos?.length * TEAM_ROW_HEIGHT) + PADDING_Y + REGION_TITLE_EXTRA), 0))}
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                />
              )}
              </g>
            </svg>

            {/* Tooltip mejorado */}
            {hoveredEquipo && (
              <div className="absolute top-4 left-4 bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm z-10 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                      {hoveredEquipo.escudo ? (
                        <img
                          src={hoveredEquipo.escudo}
                          alt={hoveredEquipo.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {hoveredEquipo.tipo === 'seleccion' ? '🏆' : '⚽'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{hoveredEquipo.nombre}</h3>
                      <p className="text-sm opacity-90">
                        {hoveredEquipo.tipo === 'seleccion' ? 'Selección Nacional' : 'Club/Equipo'} • {hoveredEquipo.pais || 'Sin país'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Región:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hoveredEquipo.regionIndex === 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {hoveredEquipo.region}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Formado:</span>
                    <span className="text-sm font-semibold text-gray-800">{formatearFecha(hoveredEquipo.fecha)}</span>
                  </div>
                  {hoveredEquipo.fechaDisolucion && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Disuelto:</span>
                      <span className="text-sm font-semibold text-gray-800">{formatearFecha(new Date(hoveredEquipo.fechaDisolucion))}</span>
                    </div>
                  )}

                  {/* Estado de actividad */}
                  <div className={`p-3 rounded-lg ${
                    hoveredEquipo.estaActivo ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <p className={`font-semibold text-sm ${
                      hoveredEquipo.estaActivo ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      {hoveredEquipo.estaActivo ? '✅ Continúa Activo' : '⏹️ Inactivo'}
                    </p>
                    {hoveredEquipo.ultimoPartido && (
                      <p className="text-xs mt-1 text-gray-600">
                        Último partido: {formatearFecha(hoveredEquipo.ultimoPartido)}
                      </p>
                    )}
                    {hoveredEquipo.estadisticas.totalPartidos === 0 && hoveredEquipo.estaActivo && (
                      <p className="text-xs mt-1 text-green-700">
                        🆕 Equipo nuevo • Sin partidos registrados aún
                      </p>
                    )}
                  </div>

                  {/* Estadísticas en grid mejorado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{hoveredEquipo.estadisticas.totalPartidos}</div>
                      <div className="text-xs text-blue-700 font-medium">Partidos</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{hoveredEquipo.estadisticas.partidosGanados}</div>
                      <div className="text-xs text-green-700 font-medium">Victorias</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{hoveredEquipo.estadisticas.partidosPerdidos}</div>
                      <div className="text-xs text-red-700 font-medium">Derrotas</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{hoveredEquipo.estadisticas.totalCompetencias}</div>
                      <div className="text-xs text-purple-700 font-medium">Competiciones</div>
                    </div>
                  </div>

                  {hoveredEquipo.estadisticas.totalPartidos > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {hoveredEquipo.estadisticas.ratioVictoria}% de victorias
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Ratio de éxito</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con estadísticas por región */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {timelineData.regiones.map((region, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-600 mb-1">{region.nombre}</div>
                <div className="text-2xl font-bold" style={{color: region.color}}>
                  {region.equipos.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {region.equipos.filter(e => e.estaActivo).length} activos
                </div>
              </div>
            ))}

            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-600 mb-1">Equipos Activos</div>
              <div className="text-2xl font-bold text-green-600">
                {equiposFiltrados.filter(e => e.estaActivo).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((equiposFiltrados.filter(e => e.estaActivo).length / equiposFiltrados.length) * 100)}% del total
              </div>
            </div>
          </div>
        </div>
      </ModalLayout>
    );
  }
