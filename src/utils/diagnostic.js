// src/utils/diagnostic.js
const BASE_URL = 'https://overtime-ddyl.onrender.com';

export async function diagnosticTest(token) {
  console.log('🔧 Ejecutando diagnóstico de conectividad...');

  const tests = [
    {
      name: 'Health Check (sin auth)',
      url: '/health',
      auth: false,
      expectedStatus: 200
    },
    {
      name: 'Mi Perfil',
      url: '/api/usuarios/mi-perfil',
      auth: true,
      expectedStatus: 200
    },
    {
      name: 'Partidos',
      url: '/api/partidos',
      auth: true,
      expectedStatus: 200
    }
  ];

  const results = {};

  for (const test of tests) {
    try {
      console.log(`🧪 Probando: ${test.name}`);

      const headers = {
        'Content-Type': 'application/json'
      };

      if (test.auth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${BASE_URL}${test.url}`, {
        method: 'GET',
        headers
      });

      console.log(`   Status: ${res.status}, OK: ${res.ok}`);

      if (res.status === test.expectedStatus) {
        results[test.name] = '✅ PASÓ';
      } else {
        const errorText = await res.text().catch(() => 'No se pudo leer respuesta');
        results[test.name] = `❌ FALLÓ - Status: ${res.status}, Respuesta: ${errorText}`;
      }
    } catch (error) {
      console.error(`   Error en ${test.name}:`, error);
      results[test.name] = `❌ ERROR - ${error.message}`;
    }
  }

  console.log('📋 Resultados del diagnóstico:');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`   ${test}: ${result}`);
  });

  return results;
}
