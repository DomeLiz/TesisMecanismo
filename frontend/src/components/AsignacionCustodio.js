import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AsignacionCustodio = () => {
  const navigate = useNavigate();
  const [cedulaAsignador, setCedulaAsignador] = useState('');
  const [cedulaCustodio, setCedulaCustodio] = useState('');
  const [mensajeAsignacion, setMensajeAsignacion] = useState('');
  const [mensajeEliminacion, setMensajeEliminacion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [custodioActual, setCustodioActual] = useState(null); // Para almacenar al custodio actual

  useEffect(() => {
    const cedula = localStorage.getItem('cedula');
    if (cedula) {
      setCedulaAsignador(cedula);
      fetchCustodian(cedula);  // Obtener el custodio actual al cargar el componente
    } else {
      setError('No se encontró la cédula del asignador en el almacenamiento local.');
    }
  }, []);

  const fetchCustodian = async (cedula) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/usuarios/get-custodian/${cedula}`);
      setCustodioActual(response.data.custodio || null);
    } catch (err) {
      setError('No se pudo obtener el custodio actual.');
      console.error('Error al obtener el custodio:', err);
    }
  };

  const handleAssignCustodian = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeAsignacion('');

    // Validación de entrada
    if (!cedulaCustodio || isNaN(cedulaCustodio)) {
      setError('Por favor, ingresa un número válido como cédula del custodio.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cedula: cedulaAsignador,
        custodioId: parseInt(cedulaCustodio, 10),
      };

      const response = await axios.post('http://localhost:3000/api/v1/usuarios/assign-custodian', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setMensajeAsignacion(response.data.message || 'Custodio asignado correctamente.');
      setCedulaCustodio('');
      fetchCustodian(cedulaAsignador);  // Actualizar el custodio después de asignar
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al asignar el custodio.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCustodian = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:3000/api/v1/usuarios/eliminar-custodio/${cedulaAsignador}`);
      setMensajeEliminacion(response.data.message || 'Custodio eliminado correctamente.');
      setCustodioActual(null);  // Limpiar el custodio en el estado
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al eliminar el custodio.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cedula');
    navigate('/login');
  };

  return (
    <div className="asignacion-custodio-container">
      <nav className="menu-lateral">
        <h2>Menú</h2>
        <ul>
          <li><button onClick={() => navigate('/inicio')}>Inicio</button></li>
          <li><button onClick={() => navigate('/datos')}>Datos</button></li>
          <li><button onClick={() => navigate('/asignacion-custodio')}>Asignación de Custodio</button></li>
          <li><button onClick={() => navigate('/datos-custodiados')}>Datos Custodiados</button></li>
          <li><button onClick={handleLogout}>Cerrar sesión</button></li>
        </ul>
      </nav>
      <main>
        <h1>Asignación de Custodio</h1>

        {mensajeAsignacion && <p style={{ color: 'green' }}>{mensajeAsignacion}</p>}
        {mensajeEliminacion && <p style={{ color: 'green' }}>{mensajeEliminacion}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <label>Cédula del Asignador</label>
          <input type="text" value={cedulaAsignador || 'No disponible'} readOnly />
        </div>

        <div>
          <label>Cédula del Custodio</label>
          <input
            type="text"
            value={cedulaCustodio || (custodioActual ? custodioActual.usuario_id : '')}  // Mostrar el custodio actual si existe
            onChange={(e) => setCedulaCustodio(e.target.value)}
            placeholder="Ingrese el id del custodio"
            required
          />
        </div>

        {custodioActual && (
          <div>
            <p><strong>Custodio Actual:</strong> {custodioActual.nombre}</p>
            <button onClick={handleRemoveCustodian} disabled={loading}>
              {loading ? 'Eliminando...' : 'Eliminar Custodio'}
            </button>
          </div>
        )}

        <form onSubmit={handleAssignCustodian}>
          <button type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Asignar Custodio'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AsignacionCustodio;
