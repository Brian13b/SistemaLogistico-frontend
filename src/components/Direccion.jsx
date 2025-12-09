export default function Direccion({ lat, lng }) {
  const [direccion, setDireccion] = useState('Cargando ubicación...');

  useEffect(() => {
    let montado = true;
    
    const obtenerDireccion = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
        const resp = await fetch(url, { headers: { 'User-Agent': 'SistemaLogisticoTUP/1.0' } });
        const data = await resp.json();

        if (montado && data.address) {
          const ciudad = data.address.city || data.address.town || data.address.village || data.address.county;
          const provincia = data.address.state || '';
          setDireccion(`${ciudad}, ${provincia}`);
        }
      } catch (error) {
        if (montado) setDireccion(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    };

    obtenerDireccion();

    return () => { montado = false; };
  }, [lat, lng]);

  return <span className="text-gray-700">{direccion}</span>;
}