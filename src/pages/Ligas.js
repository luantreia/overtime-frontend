import React from "react";
import ligas from "../data/ligas";
import equipos from "../data/equipos";
import TarjetaLiga from "../components/models/tarjetaliga";

function Ligas () {
  return (
    <div style={styles.lista}>
      {ligas.map((liga) => (
        <TarjetaLiga key={liga.id} liga={liga} equipos={equipos} />
      ))}
    </div>
  );
};
  const styles = {
    lista: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '10px',
      padding: '10px',
    }

};



export default Ligas;
