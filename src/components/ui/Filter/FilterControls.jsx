// src/components/ui/Filter/FilterControls.jsx
import React from 'react';
import { Card, Select, Button } from '../index';

/**
 * Componente FilterControls para controles de filtrado reutilizables
 */
const FilterControls = ({
  filters = [],
  onFilterChange,
  onClearFilters,
  className = ''
}) => {
  return (
    <Card className={`mb-6 ${className}`}>
      <div className="flex flex-wrap gap-4 items-end">
        {filters.map((filter, index) => (
          <div key={index} className="flex-1 min-w-[200px]">
            <Select
              label={filter.label}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              options={filter.options}
              placeholder={filter.placeholder}
            />
          </div>
        ))}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FilterControls;
