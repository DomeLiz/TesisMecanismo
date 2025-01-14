import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AsignacionCustodio = () => {
  const navigate = useNavigate();
  const [cedulaAsignador, setCedulaAsignador] = useState('');
  const [custodioId, setCustodioId] = useState('');
  const [emailCustodio, setEmailCustodio] = useState(''); // Nuevo estado para el email del custodio
  const [otp, setOtp] = useState(''); // Estado para el OTP ingresado
  const [otpSent, setOtpSent] = useState(false); // Estado para saber si el OTP fue enviado
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [custodioActual, setCustodioActual] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const cedula = localStorage.getItem('cedula');
    if (cedula) {
      setCedulaAsignador(cedula);
      fetchCustodian(cedula);
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

  const sendOtp = async (email) => {
    try {
      await axios.post(
        `http://localhost:3000/api/v1/auth/send-otp`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOtpSent(true);
      setError('');
    } catch (error) {
      console.error('Error al enviar el OTP:', error);
      setError('Error al enviar el OTP. Por favor, inténtalo de nuevo.');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/auth/verify-otp-custodiado`,
        { email: emailCustodio, otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.success;
    } catch (error) {
      console.error('Error al verificar OTP:', error);
      setError('OTP incorrecto o expirado. Por favor, intenta nuevamente.');
      return false;
    }
  };

  const fetchCustodioEmail = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/usuarios/${id}`);
      return response.data.email;
    } catch (error) {
      console.error('Error al obtener el email del custodio:', error);
      setError('No se pudo obtener el email del custodio.');
      throw new Error('Email no encontrado');
    }
  };

  const handleAssignCustodian = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!custodioId || isNaN(custodioId)) {
      setError('Por favor, ingresa un ID válido de custodio.');
      return;
    }

    try {
      setLoading(true);
      const email = await fetchCustodioEmail(custodioId);
      setEmailCustodio(email);
      await sendOtp(email);
    } catch (err) {
      setError('Error al preparar la asignación.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!otpSent) {
      setError('Primero debes enviar el OTP.');
      return;
    }

    const isOtpValid = await verifyOtp();
    if (isOtpValid) {
      try {
        setLoading(true);
        const payload = { cedula: cedulaAsignador, custodioId: parseInt(custodioId, 10) };

        const response = await axios.post('http://localhost:3000/api/v1/usuarios/assign-custodian', payload, {
          headers: { 'Content-Type': 'application/json' },
        });

        setMensaje(response.data.message || 'Custodio asignado correctamente.');
        setCustodioId('');
        setOtp('');
        setOtpSent(false);
        fetchCustodian(cedulaAsignador);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al asignar el custodio.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveCustodian = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:3000/api/v1/usuarios/eliminar-custodio/${cedulaAsignador}`);
      setMensaje(response.data.message || 'Custodio eliminado correctamente.');
      setCustodioActual(null);
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
          <li><button onClick={() => navigate('/eliminar-datos')}>Eliminar Datos Custodiados</button></li>
          <li><button onClick={handleLogout}>Cerrar sesión</button></li>
        </ul>
      </nav>

      <main>
        <h1>Asignación de Custodio</h1>

        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <label>Cédula del Asignador</label>
          <input type="text" value={cedulaAsignador || 'No disponible'} readOnly />
        </div>

        <form onSubmit={handleAssignCustodian}>
          <div>
            <label>ID del Custodio</label>
            <input
              type="text"
              value={custodioId}
              onChange={(e) => setCustodioId(e.target.value)}
              placeholder="Ingrese el id del custodio"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Preparando...' : 'Enviar OTP'}
          </button>
        </form>

        {otpSent && (
          <div>
            <label>Ingresa el OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Ingrese el OTP recibido"
              required
            />
            <button onClick={handleConfirmAssign} disabled={loading}>
              {loading ? 'Asignando...' : 'Confirmar Asignación'}
            </button>
          </div>
        )}

        {custodioActual && (
          <div>
            <p><strong>Custodio Actual:</strong> {custodioActual.nombre}</p>
            <button onClick={handleRemoveCustodian} disabled={loading}>
              {loading ? 'Eliminando...' : 'Eliminar Custodio'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AsignacionCustodio;
