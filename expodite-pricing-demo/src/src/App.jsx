import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function App() {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');

  const handleUpload = (file) => {
    if (!file) return;
    const isExcel = file.name.endsWith('.xlsx');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          setData(jsonData);
          setMessage(`Loaded ${jsonData.length} rows from Excel file.`);
        } catch (error) {
          setMessage('Failed to read Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setData(result.data);
          setMessage(`Loaded ${result.data.length} rows from CSV file.`);
        },
        error: () => setMessage('Failed to parse CSV file.'),
      });
    }
  };

  const downloadSample = (type) => {
    const sample = [
      {
        Client_Code: 'CLI-0001',
        Product_Code: 'PRD-0001',
        Fixed_Price: 120,
        Currency: 'INR',
        UoM: 'PCS',
        Valid_From: '2025-01-01',
        Valid_To: '',
        Notes: 'Sample data',
      },
    ];

    if (type === 'csv') {
      const csv = Papa.unparse(sample);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Price_Master_Sample.csv';
      a.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(sample);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sample');
      XLSX.writeFile(wb, 'Price_Master_Sample.xlsx');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Expodite — Pricing Upload Demo</h1>
      <p className="text-gray-600">
        Upload your pricing file (.csv or .xlsx). If no price exists for a client-product pair, it falls back to the product master automatically.
      </p>

      <div className="flex flex-col gap-3 border p-4 rounded-xl bg-gray-50">
        <input type="file" accept=".csv,.xlsx" onChange={(e) => handleUpload(e.target.files[0])} />
        <div className="flex gap-2">
          <button onClick={() => downloadSample('csv')} className="px-3 py-1 bg-blue-500 text-white rounded">Sample CSV</button>
          <button onClick={() => downloadSample('xlsx')} className="px-3 py-1 bg-green-600 text-white rounded">Sample Excel</button>
        </div>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {data.length > 0 && (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key} className="border px-2 py-1 text-left">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i} className="border px-2 py-1">{String(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
