import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import ExcelUploader from './components/ExcelUploader';
import ClientsTable from './components/ClientsTable';
import { Users, Loader2, Plus, Search, Filter, LogOut, Settings } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/clientes';

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const { getAuthHeaders, logout, usuario } = useAuth();

  const canUpload = usuario?.rol === 'admin' || usuario?.rol === 'supervisor';

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL, { headers: getAuthHeaders() });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Error fetching clients');
      const data = await res.json();
      setClients(data);
      if (data.length === 0 && canUpload) setShowUploader(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDataLoaded = async (data, fileName) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
    const filteredClient = filteredClients[clientIndex];
    if (!filteredClient?.id) return;
    try {
      const res = await fetch(`${API_URL}/${filteredClient.id}/estado`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado_gestion: newStatus })
      });
      if (!res.ok) throw new Error('Error updating client');
      const updatedClient = await res.json();
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    } catch (error) {
      console.error(error);
    }
  };

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
            <span className="stat-badge pending">
              {clients.filter(c => c.estado_gestion === 'Sin gestión').length} Pendientes
            </span>
          </div>
          
          {canUpload && (
            <button className="btn btn-primary" onClick={() => setShowUploader(!showUploader)}>
              <Plus size={18} />
              {showUploader ? 'Ocultar Carga' : 'Cargar Clientes'}
            </button>
          )}

          {usuario?.rol === 'admin' && (
            <Link to="/usuarios" className="btn btn-secondary" title="Gestionar Usuarios">
              <Settings size={18} />
              <span className="hide-mobile">Usuarios</span>
            </Link>
          )}

          <button className="btn btn-logout" onClick={logout} title={`Cerrar sesión (${usuario?.nombre})`}>
            <LogOut size={18} />
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
            {showUploader && canUpload && (
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
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-box">
                  <Filter size={18} className="filter-icon" />
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="Todos">Todos los estados</option>
                    <option value="Sin gestión">Sin gestión</option>
                    <option value="Gestionado">Gestionado</option>
                  </select>
                </div>
              </div>

              {clients.length === 0 ? (
                <div className="empty-state glass-panel">
                  <p>No hay clientes en la base de datos. {canUpload && 'Utiliza el botón "Cargar Clientes" para subir tu primer Excel.'}</p>
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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute roles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
