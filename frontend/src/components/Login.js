import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
        cedula,
        password
      });

      // Supongamos que el backend devuelve un campo `role` para saber si es admin o user
      const { role } = response.data;

      // Comprobar si las credenciales son para el administrador
      if (cedula === '1750691111' && password === 'adminadmin') {
        navigate('/admin-verify-otp', { 
          state: { 
            cedula,         // Pasar la cédula del admin
            role,           // Pasar el rol (admin)
          }
        });
      } else {
        // Para otros usuarios
        navigate('/verify-otp', { 
          state: { 
            cedula,         // Pasar la cédula del usuario
            role,           // Pasar el rol (user)
          }
        });
      }
    } catch (error) {
      setError('Error en el inicio de sesión');
      console.error('Error en el login:', error);
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          name="cedula"
          placeholder="Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar sesión</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
