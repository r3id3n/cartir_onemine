import React, { useState, useEffect } from 'react';

function DataLoader() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [shiftFilter, setShiftFilter] = useState(''); // Estado para el filtro de turno
  const [sectionFilter, setSectionFilter] = useState(''); // Estado para el filtro de sección
  const [calleFilter, setCalleFilter] = useState(''); // Estado para el filtro de calle
  const [zanjaFilter, setZanjaFilter] = useState(''); // Estado para el filtro de zanja

  useEffect(() => {
    fetch('/cartir.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setData(data.Items))
      .catch(error => setError(error));
  }, []);

  const handleShiftFilterChange = (event) => {
    setShiftFilter(event.target.value); // Actualizar el estado del filtro de turno
  };

  const handleSectionFilterChange = (event) => {
    setSectionFilter(event.target.value); // Actualizar el estado del filtro de sección
    setCalleFilter(''); // Resetear el filtro de calle al cambiar la sección
    setZanjaFilter(''); // Resetear el filtro de zanja al cambiar la sección
  };

  const handleCalleFilterChange = (event) => {
    setCalleFilter(event.target.value); // Actualizar el estado del filtro de calle
    setZanjaFilter(''); // Resetear el filtro de zanja al cambiar la calle
  };

  const handleZanjaFilterChange = (event) => {
    setZanjaFilter(event.target.value); // Actualizar el estado del filtro de zanja
  };

  // Función para dividir el campo Code
  const splitCode = (code) => {
    if (code.includes('_')) {
      const [calle, zanja] = code.split('_');
      return { calle, zanja };
    } else {
      const calle = code.slice(0, 3);
      const zanja = code.slice(3);
      return { calle, zanja };
    }
  };

  // Filtrar los datos según el turno, sección, calle y zanja seleccionados
  const filteredData = data.filter(item => {
    const [id, date, shift, code, section, value1, value2] = item.Value.split('/');
    const { calle, zanja } = splitCode(code);
    return (shiftFilter === '' || shift === shiftFilter) &&
           (sectionFilter === '' || section === sectionFilter) &&
           (calleFilter === '' || calle === calleFilter) &&
           (zanjaFilter === '' || zanja === zanjaFilter);
  });

  // Obtener todas las opciones de secciones disponibles
  const sections = Array.from(new Set(data.map(item => item.Value.split('/')[4])));

  // Obtener todas las opciones de calles disponibles según la sección seleccionada
  const filteredBySection = data.filter(item => item.Value.split('/')[4] === sectionFilter || sectionFilter === '');
  const calles = Array.from(new Set(filteredBySection.map(item => {
    const code = item.Value.split('/')[3];
    const { calle } = splitCode(code);
    return calle;
  })));

  // Obtener todas las opciones de zanjas disponibles según la calle seleccionada
  const filteredByCalle = filteredBySection.filter(item => {
    const code = item.Value.split('/')[3];
    const { calle } = splitCode(code);
    return calle === calleFilter || calleFilter === '';
  });
  const zanjas = Array.from(new Set(filteredByCalle.map(item => {
    const code = item.Value.split('/')[3];
    const { zanja } = splitCode(code);
    return zanja;
  })));

  if (error) {
    return <div>Error loading JSON: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cartir_total Data</h1>
      
      <div className="mb-4">
        <label htmlFor="shiftFilter" className="mr-2">Filter by Turno:</label>
        <select 
          id="shiftFilter" 
          value={shiftFilter} 
          onChange={handleShiftFilterChange} 
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All</option>
          <option value="Turno Dia">Turno Dia</option>
          <option value="Turno Noche">Turno Noche</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="sectionFilter" className="mr-2">Filter by Macro Bloque:</label>
        <select 
          id="sectionFilter" 
          value={sectionFilter} 
          onChange={handleSectionFilterChange} 
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All</option>
          {sections.map((section, index) => (
            <option key={index} value={section}>{section}</option>
          ))}
        </select>
      </div>

      {sectionFilter && (
        <div className="mb-4">
          <label htmlFor="calleFilter" className="mr-2">Filter by Calle:</label>
          <select 
            id="calleFilter" 
            value={calleFilter} 
            onChange={handleCalleFilterChange} 
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">All</option>
            {calles.map((calle, index) => (
              <option key={index} value={calle}>{calle}</option>
            ))}
          </select>
        </div>
      )}

      {calleFilter && (
        <div className="mb-4">
          <label htmlFor="zanjaFilter" className="mr-2">Filter by Zanja:</label>
          <select 
            id="zanjaFilter" 
            value={zanjaFilter} 
            onChange={handleZanjaFilterChange} 
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">All</option>
            {zanjas.map((zanja, index) => (
              <option key={index} value={zanja}>{zanja}</option>
            ))}
          </select>
        </div>
      )}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Fecha</th>
            <th className="py-2">Turno</th>
            <th className="py-2">Calle</th>
            <th className="py-2">Zanja</th>
            <th className="py-2">Macro Bloque</th>
            <th className="py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => {
            const [id, date, shift, code, section, value1, value2] = item.Value.split('/');
            const { calle, zanja } = splitCode(code);
            return (
              <tr key={index} className="text-center">
                <td className="py-2">{id}</td>
                <td className="py-2">{date}</td>
                <td className="py-2">{shift}</td>
                <td className="py-2">{calle}</td>
                <td className="py-2">{zanja}</td>
                <td className="py-2">{section}</td>
                <td className="py-2">{Math.round(parseFloat(value1) || 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataLoader;
