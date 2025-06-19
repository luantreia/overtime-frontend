// src/components/common/ModalLayout.js
import React from 'react';

export default function ModalLayout({ children, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: 10
  },
  modal: {
    backgroundColor: 'white', borderRadius: 8, padding: 20,
    width: '95%', maxWidth: 1100, maxHeight: '90vh',
    overflowY: 'auto', position: 'relative',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    fontSize: 14,
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  }
};
