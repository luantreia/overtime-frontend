// src/components/modals/ModalPartido/tarjetapartido.js

import React from "react";

// The 'onClick' prop is crucial for making the card interactive.
// The 'partido' prop should contain all the necessary data,
// with equipoLocal and equipoVisitante already populated (objects, not just IDs).
function TarjetaPartido({ partido, onClick }) { // Removed 'equipos' prop, as it's not needed if 'partido' is populated
  // Ensure partido exists and its properties are accessible
  if (!partido) {
    return null; // Or some fallback UI
  }

  // Access equipoLocal and equipoVisitante directly from the partido object.
  // Use optional chaining (?.) for safety, in case they are not yet populated or null.
  // Note: Your Mongoose schema defines 'equipoLocal' and 'equipoVisitante' directly,
  // not an array named 'equipos'.
  const equipoLocal = partido.equipoLocal;
  const equipoVisitante = partido.equipoVisitante;

  // Extract names and escudos, providing fallbacks
  const nombreLocal = equipoLocal?.nombre || "Equipo Local";
  const nombreVisitante = equipoVisitante?.nombre || "Equipo Visitante";

  const escudoLocal = equipoLocal?.escudo || "";
  const escudoVisitante = equipoVisitante?.escudo || "";

  return (
    <div style={styles.card} onClick={onClick}> {/* Attach onClick to the card div */}
      <div style={styles.escudos}>
        <img src={escudoLocal || undefined} alt={nombreLocal} style={styles.img} />
        <span style={styles.vs}>vs</span>
        <img src={escudoVisitante || undefined} alt={nombreVisitante} style={styles.img} />
      </div>
      <h3 style={styles.nombre}>{nombreLocal} vs {nombreVisitante}</h3>
      {partido.liga && <p style={styles.liga}>{partido.liga}</p>}
      <p style={styles.fecha}>{new Date(partido.fecha).toLocaleDateString()}</p>
      {/* The button can still be here, but the whole card is clickable */}
      <button style={styles.boton} onClick={(e) => { e.stopPropagation(); onClick(); }}>Ver más</button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "10px",
    width: "200px",
    textAlign: "center",
    background: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    cursor: "pointer", // Make the card clickable
  },
  escudos: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  },
  img: {
    width: "40px",
    height: "40px",
    objectFit: "contain"
  },
  vs: {
    fontWeight: "bold"
  },
  nombre: {
    fontSize: "16px",
    margin: "10px 0 5px 0"
  },
  liga: {
    fontSize: "14px",
    color: "#666"
  },
  fecha: {
    fontSize: "13px",
    color: "#888"
  },
  boton: {
    marginTop: "8px",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer"
  }
};

export default TarjetaPartido;