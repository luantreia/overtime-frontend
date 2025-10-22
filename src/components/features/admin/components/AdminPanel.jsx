// src/components/features/admin/components/AdminPanel.jsx
import React, { useState } from 'react';
import { Card, Badge, Button, Select } from '../../../ui';

/**
 * Panel principal de administración con navegación y controles
 */
export const AdminPanel = ({
  title = 'Panel de Administración',
  children,
  activeSection,
  onSectionChange,
  sections = [],
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${className}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            ✕
          </Button>
        </div>

        <nav className="mt-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                onSectionChange?.(section.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-200 ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-r-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{section.icon}</span>
              {section.label}
              {section.badge && (
                <Badge variant={section.badge.variant} size="xs" className="ml-auto">
                  {section.badge.text}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4"
              >
                ☰
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {sections.find(s => s.id === activeSection)?.label || title}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="success">
                Modo Admin
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
