import React from 'react';
function BotonEditar({ onClick }) {
  <button onClick={onClick}>✎ Editar</button>;
}

const styles = {
  botonEditar: {
    padding: '6px 12px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
  }
};

export default BotonEditar;
