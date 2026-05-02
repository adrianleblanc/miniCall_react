import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, Users, Clock, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ReportsPage.css';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/clientes', '') || 'http://localhost:3000';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/reportes/resumen`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Error al cargar reportes');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="reports-loading">
        <Loader2 className="spinner" size={48} />
        <p>Generando reportes en tiempo real...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-error glass-panel">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchReports}>Reintentar</button>
      </div>
    );
  }

  const { kpis, productividad, hoy, ultimasGestiones } = data;
  const avancePercent = Math.round((kpis.total_gestionados / kpis.total_clientes) * 100) || 0;

  return (
    <div className="reports-container animate-fade-in">
      <header className="reports-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Volver
        </button>
        <div className="header-title">
          <BarChart3 size={28} className="icon-primary" />
          <h1>Panel de Estadísticas</h1>
        </div>
      </header>

      {/* Tarjetas de KPI */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrap blue">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Clientes</span>
            <span className="kpi-value">{kpis.total_clientes}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrap green">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Gestionados</span>
            <span className="kpi-value">{kpis.total_gestionados}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrap orange">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Gestiones Hoy</span>
            <span className="kpi-value">{hoy}</span>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrap purple">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Progreso</span>
            <span className="kpi-value">{avancePercent}%</span>
          </div>
        </div>
      </div>

      <div className="reports-main-grid">
        {/* Gráfico de Productividad */}
        <section className="report-section glass-panel">
          <div className="section-header">
            <h3>Productividad por Agente</h3>
          </div>
          <div className="productivity-list">
            {productividad.map((p, idx) => {
              const maxGestiones = Math.max(...productividad.map(u => parseInt(u.cantidad_gestiones))) || 1;
              const barWidth = (parseInt(p.cantidad_gestiones) / maxGestiones) * 100;
              
              return (
                <div key={idx} className="productivity-row">
                  <div className="agent-info">
                    <span className="agent-name">{p.nombre}</span>
                    <span className="agent-count">{p.cantidad_gestiones} gestiones</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${barWidth}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Últimas Gestiones */}
        <section className="report-section glass-panel">
          <div className="section-header">
            <h3>Últimos Movimientos</h3>
          </div>
          <div className="latest-actions">
            {ultimasGestiones.length === 0 ? (
              <p className="empty-msg">No hay gestiones registradas aún.</p>
            ) : (
              ultimasGestiones.map((g, idx) => (
                <div key={idx} className="action-item">
                  <div className="action-dot"></div>
                  <div className="action-content">
                    <p className="action-text">
                      <strong>{g.usuario_nombre}</strong> cambió a <strong>{g.cliente_nombre} {g.cliente_apellidos}</strong> a <span className="status-highlight">{g.estado_nuevo}</span>
                    </p>
                    <span className="action-time">{new Date(g.fecha_gestion).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportsPage;
