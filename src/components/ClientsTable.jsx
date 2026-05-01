import { Phone } from 'lucide-react';
import './ClientsTable.css';

const ClientsTable = ({ clients, onUpdateStatus }) => {
  // Helper to extract values even if columns have slightly different cases (e.g. RUT, Rut, rut, Nombre, nombre)
  const getVal = (client, possibleKeys) => {
    const key = Object.keys(client).find(k => possibleKeys.includes(k.toLowerCase()));
    return key ? client[key] : '-';
  };

  return (
    <div className="table-container glass-panel">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Teléfono</th>
              <th className="action-column">Acción</th>
              <th>Estado gestión</th>
              <th>Última gestión</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => {
              const rut = getVal(client, ['rut', 'r.u.t', 'r.u.t.']);
              const nombre = getVal(client, ['nombre', 'nombres', 'name', 'first name']);
              const apellidos = getVal(client, ['apellidos', 'apellido', 'last name', 'surname']);
              const telefono = getVal(client, ['teléfono', 'telefono', 'tel', 'phone', 'celular', 'móvil', 'movil']);
              
              // Clean phone number to ensure it works well with tel: protocol
              const cleanPhone = telefono !== '-' ? String(telefono).replace(/[^\d+]/g, '') : '';

              return (
                <tr key={index}>
                  <td>
                    <span className="cell-value">{rut}</span>
                  </td>
                  <td>
                    <span className="cell-value font-medium">{nombre}</span>
                  </td>
                  <td>
                    <span className="cell-value">{apellidos}</span>
                  </td>
                  <td>
                    <span className="cell-value">{telefono}</span>
                  </td>
                  <td className="action-column">
                    {cleanPhone ? (
                      <a 
                        href={`tel:${cleanPhone}`} 
                        className="btn btn-call"
                        title={`Llamar a ${nombre} al ${cleanPhone}`}
                      >
                        <Phone size={16} />
                        Llamar
                      </a>
                    ) : (
                      <span className="no-phone">Sin número</span>
                    )}
                  </td>
                  <td>
                    <select 
                      className="status-select"
                      value={client.estado_gestion || 'Sin gestión'}
                      onChange={(e) => onUpdateStatus(index, e.target.value)}
                    >
                      <option value="Sin gestión">Sin gestión</option>
                      <option value="Gestionado">Gestionado</option>
                    </select>
                  </td>
                  <td>
                    <span className="cell-value date-value">
                      {client.ultima_gestion 
                        ? new Date(client.ultima_gestion).toLocaleString() 
                        : '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;
