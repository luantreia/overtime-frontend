// src/components/common/VirtualizedList.js
import React, { useMemo, useState, useEffect, useRef } from 'react';

/**
 * Componente de lista virtualizada para mejorar rendimiento con listas grandes
 * Solo renderiza los elementos visibles en el viewport
 */
const VirtualizedList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
  className = '',
  overscan = 5 // elementos adicionales a renderizar fuera del viewport
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calcular qué elementos son visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Elementos visibles
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      originalIndex: visibleRange.startIndex + index
    }));
  }, [items, visibleRange]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Altura total del contenido
  const totalHeight = items.length * itemHeight;

  // Offset para posicionar correctamente los elementos visibles
  const offsetY = visibleRange.startIndex * itemHeight;

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <p className="text-gray-500">No hay elementos para mostrar</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, originalIndex }) => (
            <div key={originalIndex} style={{ height: itemHeight }}>
              {renderItem(item, originalIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedList;
