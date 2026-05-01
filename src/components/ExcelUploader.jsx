import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileType } from 'lucide-react';
import './ExcelUploader.css';

const ExcelUploader = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        // Validate minimally if it has some expected columns, or just pass it
        // Expected columns from prompt: Rut, Nombre, Apellidos, Teléfono (case insensitive ideally)
        if (jsonData.length === 0) {
          setError("El archivo está vacío.");
          return;
        }

        onDataLoaded(jsonData, file.name);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        setError("Error al leer el archivo Excel. Asegúrate de que sea un formato válido (.xlsx, .xls).");
      }
    };
    
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="uploader-wrapper">
      <div 
        className={`drop-zone glass-panel ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <UploadCloud size={48} className="upload-icon" />
        <h3>Sube tu archivo de clientes</h3>
        <p>Arrastra y suelta tu archivo Excel (.xlsx) aquí, o haz clic para seleccionar</p>
        <div className="supported-formats">
          <FileType size={16} />
          <span>Soporta .xlsx, .xls, .csv</span>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ExcelUploader;
