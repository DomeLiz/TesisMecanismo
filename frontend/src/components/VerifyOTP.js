import React, { useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const userRole = location.state?.role; // Obtener el rol del usuario pasado desde Login
  const isAdmin = location.state?.isAdmin; // Comprobar si es admin

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aquí debes hacer la solicitud al backend para verificar el OTP
      const response = await axios.post('http://localhost:3000/api/v1/auth/verify-otp', {
        otp, // Enviar el OTP ingresado por el usuario
        cedula: isAdmin ? '1750691111' : '' // Enviar la cédula del admin si es admin
      });

      // Si el OTP es correcto, redirige al inicio correcto según el rol
      if (response.data.success) {
        if (userRole === 'admin') {
          navigate('/inicio-admin');
        } else {
          navigate('/inicio');
        }
      } else {
        // Si la verificación del OTP falla, muestra el error
        setError('OTP incorrecto');
      }
    } catch (error) {
      console.error(error);
      setError('Error en la verificación del OTP');
    }
  };

  return (
    <div>
      <h2>Verificación de OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="otp"
          placeholder="Ingresa el OTP"
          value={otp}
          onChange={handleChange}
          required
        />
        <button type="submit">Verificar OTP</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default VerifyOtp;
