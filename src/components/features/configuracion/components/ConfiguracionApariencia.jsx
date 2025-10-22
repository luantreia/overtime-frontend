// src/components/features/configuracion/components/ConfiguracionApariencia.jsx
import React, { useState } from 'react';
import { Card, Badge, Button, Select, Spinner } from '../../../ui';

/**
 * Componente para configuración de apariencia y temas
 */
const ConfiguracionApariencia = () => {
  const [tema, setTema] = useState('sistema');
  const [colorPrimario, setColorPrimario] = useState('#1e3a8a');
  const [colorSecundario, setColorSecundario] = useState('#059669');
  const [tamanioFuente, setTamanioFuente] = useState('medio');
  const [animaciones, setAnimaciones] = useState(true);

  const handleGuardar = () => {
    // Aquí se guardarían los cambios en localStorage o enviar al servidor
    const configuracionTema = {
      tema,
      colorPrimario,
      colorSecundario,
      tamanioFuente,
      animaciones
    };

    localStorage.setItem('configuracionTema', JSON.stringify(configuracionTema));

    // Aplicar cambios inmediatamente
    aplicarTema(configuracionTema);
  };

  const aplicarTema = (config) => {
    // Aplicar colores CSS personalizados
    document.documentElement.style.setProperty('--color-primary', config.colorPrimario);
    document.documentElement.style.setProperty('--color-secondary', config.colorSecundario);

    // Aplicar tamaño de fuente
    const fontSizes = {
      pequeno: '14px',
      medio: '16px',
      grande: '18px'
    };
    document.documentElement.style.setProperty('font-size', fontSizes[config.tamanioFuente]);

    // Aplicar animaciones
    if (!config.animaciones) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }
  };

  const coloresPredefinidos = [
    { nombre: 'Azul', primario: '#1e3a8a', secundario: '#059669' },
    { nombre: 'Verde', primario: '#059669', secundario: '#1e3a8a' },
    { nombre: 'Morado', primario: '#7c3aed', secundario: '#059669' },
    { nombre: 'Rojo', primario: '#dc2626', secundario: '#1e3a8a' },
    { nombre: 'Naranja', primario: '#ea580c', secundario: '#059669' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración de Apariencia
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Personaliza la apariencia de la aplicación
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tema general */}
          <Card title="Tema General">
            <div className="space-y-4">
              <Select
                label="Tema de la aplicación"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                options={[
                  { value: 'claro', label: '🌞 Claro' },
                  { value: 'oscuro', label: '🌙 Oscuro' },
                  { value: 'sistema', label: '🖥️ Sistema' }
                ]}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                     onClick={() => setTema('claro')}>
                  <div className="w-8 h-8 bg-white border border-gray-300 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium">Claro</div>
                </div>
                <div className="text-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                     onClick={() => setTema('oscuro')}>
                  <div className="w-8 h-8 bg-gray-800 border border-gray-600 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium">Oscuro</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Colores personalizados */}
          <Card title="Colores Personalizados">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color primario
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="#1e3a8a"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color secundario
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={colorSecundario}
                    onChange={(e) => setColorSecundario(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colorSecundario}
                    onChange={(e) => setColorSecundario(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="#059669"
                  />
                </div>
              </div>

              {/* Colores predefinidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Esquemas predefinidos
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {coloresPredefinidos.map((esquema, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setColorPrimario(esquema.primario);
                        setColorSecundario(esquema.secundario);
                      }}
                      className="p-2 border border-gray-300 rounded hover:border-blue-500 transition-colors"
                      title={esquema.nombre}
                    >
                      <div
                        className="w-6 h-6 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: esquema.primario }}
                      ></div>
                      <div
                        className="w-6 h-2 rounded mx-auto"
                        style={{ backgroundColor: esquema.secundario }}
                      ></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Configuración de fuente */}
          <Card title="Configuración de Fuente">
            <div className="space-y-4">
              <Select
                label="Tamaño de fuente"
                value={tamanioFuente}
                onChange={(e) => setTamanioFuente(e.target.value)}
                options={[
                  { value: 'pequeno', label: 'Pequeño' },
                  { value: 'medio', label: 'Medio' },
                  { value: 'grande', label: 'Grande' }
                ]}
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="animaciones"
                  checked={animaciones}
                  onChange={(e) => setAnimaciones(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="animaciones" className="text-sm text-gray-700 dark:text-gray-300">
                  Habilitar animaciones
                </label>
              </div>

              {/* Vista previa */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Vista previa:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary">Ejemplo de badge</Badge>
                    <Button size="sm">Botón de ejemplo</Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Este es un ejemplo de cómo se verá el texto con la configuración actual.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Configuración avanzada */}
          <Card title="Configuración Avanzada">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="modoAltoContraste"
                  className="rounded border-gray-300"
                />
                <label htmlFor="modoAltoContraste" className="text-sm text-gray-700 dark:text-gray-300">
                  Modo de alto contraste
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="reducirMovimiento"
                  className="rounded border-gray-300"
                />
                <label htmlFor="reducirMovimiento" className="text-sm text-gray-700 dark:text-gray-300">
                  Reducir movimiento y animaciones
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="modoCompacto"
                  className="rounded border-gray-300"
                />
                <label htmlFor="modoCompacto" className="text-sm text-gray-700 dark:text-gray-300">
                  Modo compacto (menos espaciado)
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline">
            Restaurar Predeterminados
          </Button>
          <Button variant="primary" onClick={handleGuardar}>
            Aplicar Cambios
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfiguracionApariencia;
