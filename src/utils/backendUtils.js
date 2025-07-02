export async function esperarYDespertarBackend() {
  try {
    console.log('Despertando el backend...');
    await fetch('https://overtime-ddyl.onrender.com/api/ping');
  } catch (e) {
    console.warn('No se pudo hacer ping al backend:', e);
  }
  // Esperamos 2 segundos para que el backend termine de levantarse
  return new Promise((resolve) => setTimeout(resolve, 2000));
}
