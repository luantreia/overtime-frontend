// src/pages/UsuariosRefactorizado.jsx
// Ejemplo de página de Usuarios actualizada con nueva estructura

import React, { useState } from 'react';
import { Card, Badge, Button, FilterControls, Spinner } from '../components/ui';
import { GestionUsuarios } from '../components/features/usuarios';
import { useAuth } from '../context/AuthContext';

export default function UsuariosRefactorizado() {
  const { user } = useAuth();

  // Verificar permisos de admin
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar usuarios</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administración completa de usuarios del sistema
            </p>
          </div>
          <Badge variant="primary" size="lg">
            Modo Admin
          </Badge>
        </div>
      </Card>

      {/* Componente de gestión de usuarios usando nuevo módulo */}
      <GestionUsuarios />
    </div>
  );
}
