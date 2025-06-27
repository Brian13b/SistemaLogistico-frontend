export default function Facturacion({ darkMode }) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Facturación</h1>
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p>Aquí iría el contenido de la página de facturación.</p>
        </div>
      </div>
    );
  }