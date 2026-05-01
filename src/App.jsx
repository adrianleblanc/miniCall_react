import { useState } from 'react';
import ExcelUploader from './components/ExcelUploader';
import ClientsTable from './components/ClientsTable';
import { Users } from 'lucide-react';
import './App.css';

function App() {
  const [clients, setClients] = useState([]);

  const handleDataLoaded = (data) => {
    // Expected data format from Excel: Array of objects with keys like 'Rut', 'Nombre', 'Apellidos', 'Teléfono'
    const initializedData = data.map(client => ({
      ...client,
      estado_gestion: client.estado_gestion || 'Sin gestión',
      ultima_gestion: client.ultima_gestion || null
    }));
    setClients(initializedData);
  };

  const updateClientStatus = (index, newStatus) => {
    const updatedClients = [...clients];
    updatedClients[index].estado_gestion = newStatus;
    updatedClients[index].ultima_gestion = new Date().toISOString();
    setClients(updatedClients);
  };

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-brand">
          <Users size={28} className="brand-icon" />
          <h1>MiniCallCenter CRM</h1>
        </div>
        <div className="header-stats">
          <span className="stat-badge">{clients.length} Clientes</span>
        </div>
      </header>

      <main className="app-main">
        {clients.length === 0 ? (
          <section className="upload-section animate-fade-in">
            <div className="welcome-text">
              <h2>Bienvenido a tu CRM</h2>
              <p>Sube tu archivo de Excel con la cartera de clientes para comenzar a gestionar tus llamadas.</p>
            </div>
            <ExcelUploader onDataLoaded={handleDataLoaded} />
          </section>
        ) : (
          <section className="table-section animate-fade-in">
            <div className="section-header">
              <h2>Cartera de Clientes</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setClients([])}
              >
                Cargar nueva cartera
              </button>
            </div>
            <ClientsTable clients={clients} onUpdateStatus={updateClientStatus} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
