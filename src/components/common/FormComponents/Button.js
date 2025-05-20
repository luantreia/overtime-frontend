// src/components/common/FormComponents/Button.js
import React from 'react';

export default function Button({  
  children,         // texto del botón  
  onClick,          // handler opcional  
  type = 'button',  // 'button' | 'submit'  
  disabled = false,  
  variant = 'primary' // 'primary' | 'danger' | 'secondary'  
}) {
  const styles = {
    base: {
      padding: '8px 12px',
      margin: "0 5px",
      marginBottom: "12px",
      borderRadius: '4px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      opacity: disabled ? 0.6 : 1,
    },
    variants: {
      primary:    { backgroundColor: 'var(--color-secundario)', color: 'white' },
      danger:     { backgroundColor: '#dc3545', color: 'white' },
      success:    { backgroundColor: '#28a745', color: 'white' },
      secondary:  { backgroundColor: '#6c757d', color: 'white' },
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles.base, ...styles.variants[variant] }}
    >
      {children}
    </button>
  );
}
