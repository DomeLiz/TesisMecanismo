import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cedula } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/verify-otp', { cedula, otp });
      localStorage.setItem('token', response.data.token);
      navigate('/persons');
    } catch (error) {
      console.error(error);
      setError('Error en la verificación del OTP');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="otp" placeholder="Ingrese OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
      <button type="submit">Verificar OTP</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default VerifyOTP;