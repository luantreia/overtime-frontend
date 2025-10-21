// src/components/common/FormComponents/SelectDropdown.js
import React from 'react';

export default function SelectDropdown({
  label,         // etiqueta sobre el select
  name,          // name para el form data
  value,         // valor seleccionado
  options = [],  // arreglo [{ value, label }]
  onChange,      // handler (e) => ...
  placeholder,   // texto del option por defecto
  error,         // mensaje de error opcional
  disabled = false
}) {
  return (
    <div style={styles.container}>
      {label && <label htmlFor={name} style={styles.label}>{label}</label>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          ...styles.select,
          ...(error ? styles.selectError : {})
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '500'
  },
  select: {
    color: "var(--color-texto-secundario)",
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '0px solid #ccc',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  selectError: {
    borderColor: '#dc3545'
  },
  error: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#dc3545'
  }
};
