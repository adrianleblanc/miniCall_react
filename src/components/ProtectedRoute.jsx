import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: '#4F46E5' }}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Verificando sesión...</p>
      </div>
    );
  }

  return usuario ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
