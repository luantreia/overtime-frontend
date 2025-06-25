// src/components/modals/ModalEstadisticasCaptura/JugadorEstadisticasCard.js
import React, { useState, useRef } from 'react';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';

export default function JugadorEstadisticasCard({
  index,
  jugadorId,
  opcionesJugadores,
  onCambiarJugador,
  onCambiarEstadistica,
  estadisticasJugador = { throws: 0, hits: 0, outs: 0, catches: 0 },
}) {
  const controles = [
    { campo: 'throws', label: 'Throws' },
    { campo: 'hits', label: 'Hits' },
    { campo: 'outs', label: 'Outs' },
    { campo: 'catches', label: 'Catches' },
  ];

  // Ref para el temporizador de long press
  const longPressTimer = useRef(null);
  // Estado para rastrear si hay un long press activo (para evitar click accidental)
  const [isLongPressing, setIsLongPressing] = useState(false);
  // Estado para el color de retroalimentación
  const [feedbackColor, setFeedbackColor] = useState(''); // 'green', 'red', or ''

  const LONG_PRESS_DELAY = 500; // Milisegundos para esperar antes de la resta repetida
  const SUBTRACT_INTERVAL = 100; // Milisegundos entre cada resta continua
  const FEEDBACK_DURATION = 300; // Milisegundos que dura el color de retroalimentación

  // Limpia el temporizador de color
  const feedbackTimer = useRef(null);

  // Inicia el temporizador para long press (restar)
  const handleMouseDown = (campo) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current); // Usar clearTimeout para el inicial
    }

    // Inicia un timeout. Si se mantiene presionado más allá del delay, se activa el long press
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      if (estadisticasJugador[campo] > 0) { // Solo resta si el valor es mayor a 0
        onCambiarEstadistica(campo, -1);
        setFeedbackColor('red');
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => setFeedbackColor(''), FEEDBACK_DURATION);
      }

      // Inicia el intervalo para resta continua si el long press está activo
      longPressTimer.current = setInterval(() => {
        if (estadisticasJugador[campo] > 0) { // Sigue restando solo si el valor es mayor a 0
          onCambiarEstadistica(campo, -1);
          setFeedbackColor('red'); // Mantener el color si sigue restando
          clearTimeout(feedbackTimer.current);
          feedbackTimer.current = setTimeout(() => setFeedbackColor(''), FEEDBACK_DURATION);
        } else {
          // Si llega a 0, detiene la resta automática
          if (longPressTimer.current) {
            clearInterval(longPressTimer.current);
            longPressTimer.current = null;
          }
          setIsLongPressing(false);
          setFeedbackColor(''); // Asegurar que el color se borre
        }
      }, SUBTRACT_INTERVAL);
    }, LONG_PRESS_DELAY);
  };

  // Detiene el temporizador de long press
  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearInterval(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  };

  // Maneja el click simple (sumar)
  const handleClick = (campo) => {
    // Si no estamos en un long press, es un click para sumar
    if (!isLongPressing) {
      onCambiarEstadistica(campo, +1);
      setFeedbackColor('green');
      clearTimeout(feedbackTimer.current); // Limpiar cualquier temporizador previo
      feedbackTimer.current = setTimeout(() => setFeedbackColor(''), FEEDBACK_DURATION);
    }
    handleMouseUp(); // Asegurarse de limpiar cualquier temporizador residual del mousedown
  };

  // Clases dinámicas para el color de feedback
  const getFeedbackClass = () => {
    if (feedbackColor === 'green') {
      return 'bg-green-300'; // Un verde claro para la retroalimentación
    } else if (feedbackColor === 'red') {
      return 'bg-red-300'; // Un rojo claro para la retroalimentación
    }
    return 'bg-gray-100'; // Color de fondo por defecto o neutro
  };


  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <SelectDropdown
        label={null}
        name={`jugador-${index}`}
        value={jugadorId}
        options={opcionesJugadores}
        onChange={(e) => onCambiarJugador(e.target.value)}
        placeholder="Seleccione jugador"
        className="mb-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      />

      <div className="grid grid-cols-1  gap-2"> {/* Grid adaptable a 1 o 2 columnas */}
        {controles.map(({ campo, label }) => {
          const valor = estadisticasJugador[campo] || 0;
          return (
            <div key={campo} className="flex flex-col items-center">
              <span className="text-gray-700 font-medium mb-1">{label}</span>
              <div
                // Eventos para desktop
                onMouseDown={() => handleMouseDown(campo)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => handleClick(campo)}
                // Eventos para mobile
                onTouchStart={() => handleMouseDown(campo)}
                onTouchEnd={handleMouseUp}
                onTouchCancel={handleMouseUp}
                // Estilos del botón numérico
                className={`flex items-center justify-center cursor-pointer select-none
                            text-xl font-bold text-gray-800
                            w-12 h-8 rounded-lg border-2 border-gray-200
                            transition-colors duration-100 ease-out
                            ${getFeedbackClass()}
                            ${valor <= 0 && isLongPressing ? 'opacity-50 cursor-not-allowed' : ''}
                            hover:shadow-md
                            `}
              >
                <span>{valor}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}