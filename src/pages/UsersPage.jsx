import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, Mail, Power, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/clientes', '') || 'http://localhost:3000';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'agente'
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/usuarios`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/usuarios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');

      setSuccess(`Usuario ${data.nombre} creado con éxito.`);
      setFormData({ nombre: '', email: '', password: '', rol: 'agente' });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const res = await fetch(`${API_BASE}/api/usuarios/${user.id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ activo: !user.activo })
      });

      if (!res.ok) throw new Error('Error al cambiar estado');
      
      setUsers(users.map(u => u.id === user.id ? { ...u, activo: !u.activo } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="users-container animate-fade-in">
      <header className="users-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>
        <h1>Gestión de Usuarios</h1>
      </header>

      <div className="users-grid">
        {/* Formulario de Creación */}
        <section className="user-form-section glass-panel">
          <div className="section-title">
            <UserPlus size={24} className="icon-primary" />
            <h2>Crear Nuevo Usuario</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleInputChange} 
                required 
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="usuario@correo.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña Temporal</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                required 
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Rol de Usuario</label>
              <div className="input-with-icon">
                <Shield size={16} />
                <select name="rol" value={formData.rol} onChange={handleInputChange}>
                  <option value="admin">Administrador (Todo)</option>
                  <option value="supervisor">Supervisor (Carga y Gestión)</option>
                  <option value="agente">Agente (Solo Gestión)</option>
                </select>
              </div>
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="spinner" /> : 'Registrar Usuario'}
            </button>
          </form>
        </section>

        {/* Lista de Usuarios */}
        <section className="user-list-section glass-panel">
          <div className="section-title">
            <Shield size={24} className="icon-primary" />
            <h2>Usuarios Registrados</h2>
          </div>

          {isLoading ? (
            <div className="loading-inline">
              <Loader2 className="spinner" />
              <span>Cargando usuarios...</span>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.nombre}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-tag ${user.rol}`}>
                          {user.rol}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot ${user.activo ? 'active' : 'inactive'}`}></span>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </td>
                      <td>
                        <button 
                          className={`btn-icon ${user.activo ? 'btn-deactivate' : 'btn-activate'}`}
                          onClick={() => toggleUserStatus(user)}
                          title={user.activo ? 'Desactivar' : 'Activar'}
                        >
                          <Power size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UsersPage;
