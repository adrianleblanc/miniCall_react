import { useState, useEffect } from 'react';
import ExcelUploader from './components/ExcelUploader';
import ClientsTable from './components/ClientsTable';
import { Users, Loader2 } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/clientes';

function App() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error fetching clients');
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDataLoaded = async (data) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error saving clients to database');
      
      // Recargar desde la base de datos para obtener los IDs reales
      await fetchClients();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const updateClientStatus = async (index, newStatus) => {
    const client = clients[index];
    if (!client || !client.id) return; // Si no tiene ID, no está en la base de datos

    try {
      const res = await fetch(`${API_URL}/${client.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_gestion: newStatus })
      });

      if (!res.ok) throw new Error('Error updating client');
      
      const updatedClient = await res.json();
      
      const updatedClients = [...clients];
      updatedClients[index] = updatedClient;
      setClients(updatedClients);
    } catch (error) {
      console.error(error);
    }
  };

  const clearClients = async () => {
    // Si quisieras borrar todo en el backend tendrías un endpoint DELETE /bulk.
    // Por ahora, solo lo borramos de la vista, o puedes omitir este botón si ahora todo es persistente.
    setClients([]);
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
        {isLoading ? (
          <div className="loading-state glass-panel">
            <Loader2 className="spinner" size={48} />
            <p>Conectando con el servidor...</p>
          </div>
        ) : clients.length === 0 ? (
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
                onClick={clearClients}
              >
                Ocultar cartera actual
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
