// Ejemplo de página de Admin refactorizada con nueva estructura

// ✅ IMPORTACIONES NUEVAS Y LIMPIAS:
import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from '../ui';
import { AdminDashboard, AdminStats } from '../features/admin';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/api/useApi';

// ✅ COMPONENTE MEJORADO:
export default function AdminRefactorizado() {
  const { user } = useAuth();
  const { get, loading, error } = useApi();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({});

  // Verificar permisos de admin
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos de administrador</p>
      </Card>
    );
  }

  // Cargar estadísticas del sistema
  React.useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const data = await get('/api/admin/estadisticas');
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  return (
    <AdminDashboard
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      stats={stats}
    />
  );
}

// ✅ VENTAJAS DE LA NUEVA ESTRUCTURA:
// 1. Separación clara de responsabilidades
// 2. Componentes reutilizables para diferentes secciones
// 3. Mejor organización por dominio administrativo
// 4. Fácil extensión con nuevas funcionalidades
// 5. Integración con el sistema de componentes UI
