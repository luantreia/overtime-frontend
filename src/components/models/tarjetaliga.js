const TarjetaLiga = ({ liga, equipos }) => {
    return (
      <div style={styles.card}>
        <div style={styles.lista}>
          {liga.equipos.map((id) => {
            const equipo = equipos.find((e) => e.id === id);
            return (
              <div key={id} style={styles.minicard}>
                <img
                  src={equipo?.foto}
                  alt={equipo?.nombre}
                />
                
              </div>
            );
          })}
        </div>
        <div style={styles.overlay}>
        <h3>{liga.nombre}</h3>
        <p>
          Temporada: <strong>{liga.temporada}</strong>
        </p>
        <p>
          Inicio: {liga.fechaInicio}
        </p>
        </div>
        
      </div>
    );
  };
  const styles = {
  card: {
    width: '260px',        // antes: 200px
    height: '260px',
    position: 'relative',
    margin: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer', // El cursor se convierte en puntero para indicar que se puede hacer clic

  },
  lista: {
    width: '100%',        // antes: 200px
    height: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: "var(--color-primario)"
  },
  minicard: {
  width: '40px',
  height: '40px',
  borderRadius: '10%',
  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',
  boxShadow: 'var(--color-secundario)',
},

overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    color: 'var(--color-fondo)',
    background: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    padding: '0px',
    textAlign: 'center',
  }
};
  
  
export default TarjetaLiga;
