// src/components/features/admin/AdminDiagnostic.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/api/useApi';

/**
 * Página de diagnóstico para verificar el funcionamiento del sistema administrativo migrado
 */
const AdminDiagnostic = () => {
  const { user, rol, token } = useAuth();
  const { get, loading } = useApi();
  const [diagnosticResults, setDiagnosticResults] = useState({});
  const [currentTest, setCurrentTest] = useState('');
  const [testResults, setTestResults] = useState({});

  // Ejecutar pruebas de diagnóstico
  useEffect(() => {
    runDiagnosticTests();
  }, []);

  // Verificar permisos de administrador
  if (!rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para acceder al diagnóstico administrativo</p>
      </Card>
    );
  }

  const runDiagnosticTests = async () => {
    setCurrentTest('Iniciando pruebas...');
    setTestResults({});
    setDiagnosticResults({});

    const tests = [
      { name: 'Permisos de Admin', test: testAdminPermissions },
      { name: 'Carga de Estadísticas', test: testAdminStats },
      { name: 'Lista de Equipos', test: testEquiposList },
      { name: 'Lista de Jugadores', test: testJugadoresList },
      { name: 'Lista de Partidos', test: testPartidosList },
      { name: 'Lista de Organizaciones', test: testOrganizacionesList },
      { name: 'Lista de Competencias', test: testCompetenciasList },
      { name: 'Solicitudes de Contrato', test: testSolicitudesContrato },
    ];

    const results = {};

    for (const test of tests) {
      setCurrentTest(`Ejecutando: ${test.name}`);
      try {
        const result = await test.test();
        results[test.name] = { success: true, data: result };
      } catch (error) {
        results[test.name] = { success: false, error: error.message };
      }
      setTestResults({ ...results });
    }

    setDiagnosticResults(results);
    setCurrentTest('');
  };

  // Test 1: Verificar permisos de admin
  const testAdminPermissions = async () => {
    return { userRole: rol, hasAdminAccess: rol?.includes('admin') };
  };

  // Test 2: Cargar estadísticas del sistema
  const testAdminStats = async () => {
    const stats = await get('/api/admin/estadisticas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { totalEquipos: stats.totalEquipos, totalJugadores: stats.totalJugadores };
  };

  // Test 3: Cargar lista de equipos
  const testEquiposList = async () => {
    const equipos = await get('/api/equipos/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { count: equipos?.length || 0, sample: equipos?.slice(0, 3) || [] };
  };

  // Test 4: Cargar lista de jugadores
  const testJugadoresList = async () => {
    const jugadores = await get('/api/jugadores/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { count: jugadores?.length || 0, sample: jugadores?.slice(0, 3) || [] };
  };

  // Test 5: Cargar lista de partidos
  const testPartidosList = async () => {
    const partidos = await get('/api/partidos/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { count: partidos?.length || 0, sample: partidos?.slice(0, 3) || [] };
  };

  // Test 6: Cargar lista de organizaciones
  const testOrganizacionesList = async () => {
    const organizaciones = await get('/api/organizaciones/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { count: organizaciones?.length || 0, sample: organizaciones?.slice(0, 3) || [] };
  };

  // Test 7: Cargar lista de competencias
  const testCompetenciasList = async () => {
    const competencias = await get('/api/competencias', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { count: competencias?.length || 0, sample: competencias?.slice(0, 3) || [] };
  };

  // Test 8: Verificar solicitudes de contrato
  const testSolicitudesContrato = async () => {
    const solicitudes = await get('/api/jugador-equipo/solicitudes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { count: solicitudes?.length || 0, sample: solicitudes?.slice(0, 3) || [] };
  };

  const getStatusIcon = (success) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🩺 Diagnóstico del Sistema Administrativo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Verificación completa del funcionamiento del sistema administrativo migrado
        </p>
      </div>

      {/* Información del usuario actual */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">👤 Información del Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Usuario:</span>
            <p className="font-medium">{user?.email || 'No identificado'}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Rol:</span>
            <p className="font-medium">{rol?.join(', ') || 'Sin rol'}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Permisos de Admin:</span>
            <Badge variant={rol?.includes('admin') ? 'success' : 'danger'}>
              {rol?.includes('admin') ? 'Sí' : 'No'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Estado actual del test */}
      {currentTest && (
        <Card variant="info">
          <div className="flex items-center space-x-2">
            <Spinner size="sm" />
            <span>{currentTest}</span>
          </div>
        </Card>
      )}

      {/* Resultados de las pruebas */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">🧪 Resultados de Pruebas</h2>
          <Button variant="primary" onClick={runDiagnosticTests} disabled={!!currentTest}>
            🔄 Ejecutar Pruebas
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(diagnosticResults).map(([testName, result]) => (
            <div key={testName} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{testName}</h3>
                <span className={`text-lg ${getStatusColor(result.success)}`}>
                  {getStatusIcon(result.success)}
                </span>
              </div>

              {result.success ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {typeof result.data === 'object' ? (
                    <div>
                      <p>✅ Prueba exitosa</p>
                      {result.data.count !== undefined && (
                        <p>Cantidad de elementos: {result.data.count}</p>
                      )}
                      {result.data.sample && result.data.sample.length > 0 && (
                        <p>Muestra: {result.data.sample.length} elementos cargados</p>
                      )}
                    </div>
                  ) : (
                    <p>✅ {result.data}</p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  ❌ Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resumen general */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Estado General:</span>
            <div className="flex items-center space-x-2">
              {Object.values(diagnosticResults).every(r => r.success) ? (
                <>
                  <span className="text-green-600 text-lg">✅</span>
                  <Badge variant="success">Todos los tests pasaron</Badge>
                </>
              ) : (
                <>
                  <span className="text-red-600 text-lg">❌</span>
                  <Badge variant="danger">Algunos tests fallaron</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Instrucciones para continuar */}
      <Card variant="info">
        <h2 className="text-xl font-semibold mb-4">📋 Próximos Pasos</h2>
        <div className="space-y-2 text-sm">
          <p>✅ <strong>Verificación automática completada</strong></p>
          <p>🔄 <strong>Pruebas de navegación:</strong> Verificar que la navegación entre secciones funciona correctamente</p>
          <p>🔄 <strong>Pruebas de modales:</strong> Abrir y cerrar cada modal administrativo para verificar funcionamiento</p>
          <p>🔄 <strong>Pruebas de permisos:</strong> Verificar que solo usuarios con permisos pueden acceder</p>
          <p>🔄 <strong>Limpieza final:</strong> Una vez verificado el funcionamiento, eliminar archivos obsoletos</p>
        </div>

        <div className="mt-4">
          <Button variant="outline" onClick={() => window.location.href = '/admin'}>
            🚀 Ir al Panel Administrativo
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDiagnostic;
