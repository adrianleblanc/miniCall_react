import { useState, useEffect } from 'react';
import ExcelUploader from './components/ExcelUploader';
import ClientsTable from './components/ClientsTable';
import { Users, Loader2, Plus, Search, Filter } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/clientes';

function App() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error fetching clients');
      const data = await res.json();
      setClients(data);
      // Si no hay clientes al cargar, mostrar el uploader
      if (data.length === 0) {
        setShowUploader(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDataLoaded = async (data, fileName) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: data, fileName })
      });
      if (!res.ok) throw new Error('Error saving clients to database');
      
      setShowUploader(false);
      await fetchClients();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const updateClientStatus = async (clientIndex, newStatus) => {
    // clientIndex is the index from the FILTERED array, so we need the original client
    const filteredClient = filteredClients[clientIndex];
    if (!filteredClient || !filteredClient.id) return;

    try {
      const res = await fetch(`${API_URL}/${filteredClient.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_gestion: newStatus })
      });

      if (!res.ok) throw new Error('Error updating client');
      
      const updatedClient = await res.json();
      
      // Update in the main array
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (error) {
      console.error(error);
    }
  };

  // Filtrado
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      (client.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.rut || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.apellidos || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todos' || client.estado_gestion === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-brand">
          <Users size={28} className="brand-icon" />
          <h1>MiniCallCenter CRM</h1>
        </div>
        <div className="header-actions">
          <div className="header-stats">
            <span className="stat-badge">{clients.length} Total</span>
            <span className="stat-badge pending">{clients.filter(c => c.estado_gestion === 'Sin gestión').length} Pendientes</span>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploader(!showUploader)}
          >
            <Plus size={18} />
            {showUploader ? 'Ocultar Carga' : 'Cargar Clientes'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {isLoading ? (
          <div className="loading-state glass-panel">
            <Loader2 className="spinner" size={48} />
            <p>Conectando con la base de datos...</p>
          </div>
        ) : (
          <div className="dashboard-layout animate-fade-in">
            {showUploader && (
              <section className="upload-section-inline glass-panel animate-fade-in">
                <ExcelUploader onDataLoaded={handleDataLoaded} />
              </section>
            )}

            <section className="table-section">
              <div className="filters-bar glass-panel">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre, rut o apellido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-box">
                  <Filter size={18} className="filter-icon" />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="Todos">Todos los estados</option>
                    <option value="Sin gestión">Sin gestión</option>
                    <option value="Gestionado">Gestionado</option>
                  </select>
                </div>
              </div>

              {clients.length === 0 ? (
                <div className="empty-state glass-panel">
                  <p>No hay clientes en la base de datos. Utiliza el botón "Cargar Clientes" para subir tu primer Excel.</p>
                </div>
              ) : (
                <ClientsTable clients={filteredClients} onUpdateStatus={updateClientStatus} />
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
