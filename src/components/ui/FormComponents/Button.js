export default function Button({  
  children,         
  onClick,          
  type = 'button',  
  disabled = false,  
  variant = 'primary' // Ahora incluye success también
}) {
  const styles = {
    base: {
      padding: '8px 12px',
      margin: "auto 5px",
      marginBottom: "12px",
      borderRadius: '4px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      opacity: disabled ? 0.6 : 1,
      transition: 'background-color 0.3s ease',
    },
    variants: {
      primary:    { backgroundColor: 'var(--color-secundario)', color: 'white' },
      danger:     { backgroundColor: 'var(--color-error)', color: 'white' },
      success:    { backgroundColor: 'var(--color-exito)', color: 'white' },
      secondary:  { backgroundColor: 'var(--color-texto-secundario)', color: 'white' },
    }
  };

  // Fallback por si viene un variant no definido
  const variantStyle = styles.variants[variant] || styles.variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles.base, ...variantStyle }}
    >
      {children}
    </button>
  );
}
