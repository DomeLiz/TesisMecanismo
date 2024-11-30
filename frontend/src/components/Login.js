import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [cedula, setCedula] = useState('');
  const [certificado, setCertificado] = useState(null); // Nuevo estado para el certificado
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!certificado) {
      setError('Debe seleccionar un certificado');
      return;
    }

    const formData = new FormData();
    formData.append('cedula', cedula);
    formData.append('certificado', certificado); // Agregar el archivo del certificado

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Indicar que se envía un formulario con archivos
          },
        }
      );

      // Desestructurar los datos de la respuesta
      const { token, role } = response.data;

      // Almacenar el token y la cédula en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('cedula', cedula);

      // Redirigir según el rol del usuario
      const route = role === 'admin' ? '/admin-verify-otp' : '/verify-otp';
      navigate(route, {
        state: {
          cedula,
        },
      });
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
          type="file"
          name="certificado"
          accept=".der" // Cambiado a .der como requerido
          onChange={(e) => setCertificado(e.target.files[0])}
          required
        />
        <button type="submit">Iniciar sesión</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
