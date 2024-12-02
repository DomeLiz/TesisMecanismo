import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [blockedTime, setBlockedTime] = useState(null);  // Para mostrar el tiempo restante si está bloqueado
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = location.state?.role;  // Obtener el rol del usuario (admin o user)
  const cedula = location.state?.cedula;  // Obtener la cédula desde el estado
  const usuario_id = localStorage.getItem('usuario_id');  // Obtener el usuario_id del localStorage
  
  // Este efecto se ejecutará cuando la página se cargue
  useEffect(() => {
    const checkBlockedTime = async () => {
      try {
        // Verificamos si el usuario tiene un bloqueo temporal
        const response = await axios.get(`http://localhost:3000/api/v1/auth/check-blocked/${cedula}`);
        if (response.data.blocked) {
          const remainingTime = response.data.remainingTime;
          setBlockedTime(remainingTime);  // Mostrar el tiempo restante de bloqueo
        }
      } catch (error) {
        console.error('Error verificando el tiempo de bloqueo:', error);
      }
    };

    checkBlockedTime();
  }, [cedula]);

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Limpiar el error anterior al enviar el formulario

    // Si el usuario está bloqueado, no proceder con la verificación
    if (blockedTime) {
      setError(`Cuenta bloqueada temporalmente. Intenta nuevamente en ${blockedTime} minutos.`);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/verify-otp', {
        otp,         // Enviar el OTP ingresado
        cedula       // Enviar la cédula que fue pasada desde el login
      });

      // Si la verificación es exitosa
      if (response.data.success) {
        navigate('/inicio'); // Redirigir a la página de inicio del usuario
      } else {
        setError('OTP incorrecto');
      }
    } catch (error) {
      // Manejo detallado de errores
      if (error.response) {
        // Errores de respuesta del servidor
        setError(`Error: ${error.response.data.message || 'Verificación fallida'}. Código de estado: ${error.response.status}`);
      } else if (error.request) {
        // Errores de la solicitud que no reciben respuesta
        setError('Error: No se recibió respuesta del servidor.');
      } else {
        // Otros errores en la solicitud
        setError(`Error: ${error.message}`);
      }
      console.error('Error en la verificación del OTP:', error);
    }
  };

  return (
    <div>
      <h2>Verificación de OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="otp"
          placeholder="Ingresa el OTP"
          value={otp}
          onChange={handleChange}
          required
        />
        <button type="submit">Verificar OTP</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {blockedTime && (
        <p>Tu cuenta está bloqueada temporalmente. Por favor, espera {blockedTime} minutos antes de intentar nuevamente.</p>
      )}
    </div>
  );
};

export default VerifyOtp;
