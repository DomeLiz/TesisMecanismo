import React, { useState } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ cedula: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Realiza la petición de login al backend
      const response = await axios.post('http://localhost:3000/api/v1/auth/login', form);

      // Guarda el token en el localStorage
      localStorage.setItem('token', response.data.token);

      // Verificar las credenciales directamente
      if (form.cedula === '1750691111' && form.password === 'adminadmin') {
        // Redirigir a la página de verificación OTP para el administrador
        navigate('/verify-otp', { state: { role: 'admin', isAdmin: true } });
      } else {
        // Para cualquier otra credencial, redirigir a la página de verificación OTP para el usuario
        navigate('/verify-otp', { state: { role: 'user', isAdmin: false } });
      }
    } catch (error) {
      console.error(error);
      setError('Error en el login');
    }
  };

  const handleRegister = () => {
    navigate('/register'); // Redirige a la página de registro
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="cedula"
          placeholder="Cédula"
          value={form.cedula}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Iniciar sesión</button>
        {error && <p>{error}</p>}
      </form>
      <button onClick={handleRegister}>Registrarse</button> {/* Botón de registro */}
    </div>
  );
};

export default Login;
