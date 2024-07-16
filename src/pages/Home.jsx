import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Home() {
  const [data, setData] = useState([]);
  const [sectionSums, setSectionSums] = useState([]);
  const [dataLoaderData, setDataLoaderData] = useState([]);

  useEffect(() => {
    fetch('/cartir.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data.Items);
        setDataLoaderData(data.Items); // Load data for DataLoader component
        calculateSums(data.Items);
      })
      .catch(error => console.error('Error loading JSON:', error));
  }, []);

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

  const calculateSums = (items) => {
    const sectionTotals = {};

    items.forEach(item => {
      const [id, date, shift, code, section, value1, value2] = item.Value.split('/');
      const numericValue1 = parseFloat(value1) || 0;
      const { calle } = splitCode(code);

      if (!sectionTotals[section]) {
        sectionTotals[section] = { totalValue1: 0, calles: {} };
      }

      sectionTotals[section].totalValue1 += numericValue1;

      if (!sectionTotals[section].calles[calle]) {
        sectionTotals[section].calles[calle] = 0;
      }

      sectionTotals[section].calles[calle] += numericValue1;
    });

    const sortedSectionSums = Object.keys(sectionTotals).map(section => ({
      section,
      totalValue1: sectionTotals[section].totalValue1,
      calles: Object.keys(sectionTotals[section].calles).map(calle => ({
        calle,
        totalValue1: sectionTotals[section].calles[calle]
      })).sort((a, b) => a.calle.localeCompare(b.calle))
    })).sort((a, b) => a.section.localeCompare(b.section));

    setSectionSums(sortedSectionSums);
  };

  const exportToExcel = () => {
    const homeData = [['Macro bloque', 'Calle', 'Total']];

    sectionSums.forEach(sectionItem => {
      sectionItem.calles.forEach(calleItem => {
        homeData.push([sectionItem.section, calleItem.calle, Math.round(calleItem.totalValue1)]);
      });
    });

    const dataLoaderDataSheet = [['ID', 'Fecha', 'Turno', 'Calle', 'Zanja', 'Macro Bloque', 'Total']];

    dataLoaderData.forEach(item => {
      const [id, date, shift, code, section, value1, value2] = item.Value.split('/');
      const { calle, zanja } = splitCode(code);
      dataLoaderDataSheet.push([id, date, shift, calle, zanja, section, Math.round(parseFloat(value1) || 0)]);
    });

    const wsHome = XLSX.utils.aoa_to_sheet(homeData);
    const wsDataLoader = XLSX.utils.aoa_to_sheet(dataLoaderDataSheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsHome, 'Sumas Macro y Calle');
    XLSX.utils.book_append_sheet(wb, wsDataLoader, 'Datos Cartir_total');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'data.xlsx');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suma Total por Macro bloque y Calle</h1>
      <button
        onClick={exportToExcel}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Exportar a Excel
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Macro bloque</th>
            <th className="py-2">Calle</th>
            <th className="py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {sectionSums.map((sectionItem, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <tr className="bg-gray-200">
                <td className="py-2" colSpan="3">{sectionItem.section} - Total: {Math.round(sectionItem.totalValue1)}</td>
              </tr>
              {sectionItem.calles.map((calleItem, calleIndex) => (
                <tr key={calleIndex} className="text-center">
                  <td className="py-2">{sectionItem.section}</td>
                  <td className="py-2">{calleItem.calle}</td>
                  <td className="py-2">{Math.round(calleItem.totalValue1)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Home;
