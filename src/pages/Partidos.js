// Partidos.js
import React from "react";
import TarjetaPartido from "../components/models/tarjetapartido";
import partidos from "../data/partidos";
import equipos from "../data/equipos"; 


function Partidos() {
  return (
    <div style={styles.lista}>
      {partidos.map(partido => (
        <TarjetaPartido
          key={partido.id}
          partido={partido}
          equipos={equipos}
        />
      ))}
    </div>
  );
}

  
  const styles = {
    lista: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px',
      padding: '10px',
    }
  };
  export default Partidos;
  