// src/components/common/FormComponents/InputText.js
import React from 'react';

export default function InputText({
  label,           // etiqueta sobre el input
  name,            // name para el form data
  value,           // valor controlado
  onChange,        // handler (e) => ...
  placeholder = '',// placeholder opcional
  type = 'text',   // 'text' | 'number' | etc.
  error,           // mensaje de error opcional
  disabled = false // deshabilitado
}) {
  return (
    <div style={styles.container}>
      {label && <label htmlFor={name} style={styles.label}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {})
        }}
      />
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
    fontWeight: '500',
  },
  input: {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  error: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#dc3545',
  },
};
