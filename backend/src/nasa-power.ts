// Función para obtener la fecha en formato YYYYMMDD
const formatDateForNasaApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Consulta la API POWER de la NASA para obtener datos de temperatura de los últimos 7 días.
 * @param lat Latitud del punto a consultar.
 * @param lon Longitud del punto a consultar.
 * @returns Un array con las temperaturas medias de los últimos 7 días.
 */
export const getTemperatureData = async (lat: number, lon: number) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);

  const apiUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=AG&longitude=${lon}&latitude=${lat}&start=${formatDateForNasaApi(
    startDate
  )}&end=${formatDateForNasaApi(endDate)}&format=JSON`;

  try {
    console.log(`🛰️  Consultando NASA POWER API: ${apiUrl}`);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta de NASA POWER API:', errorText);
      throw new Error(`Error en la API de la NASA: ${response.statusText}`);
    }

    const data = (await response.json()) as any;

    // Parsear la respuesta para devolver un formato limpio
    const temperatures = data.properties.parameter.T2M;
    const result = Object.keys(temperatures).map(dateStr => {
      // Formatear la fecha de YYYYMMDD a YYYY-MM-DD
      const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(
        4,
        6
      )}-${dateStr.substring(6, 8)}`;
      return {
        date: formattedDate,
        temp_avg: temperatures[dateStr],
      };
    });

    return result;
  } catch (error) {
    console.error('❌ Fallo al contactar con la NASA POWER API:', error);
    throw error;
  }
};
