import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditarDatosCustodiados = () => {
  const { state } = useLocation();
  const { custodiado } = state;
  const [formData, setFormData] = useState({
    nombre: custodiado.nombre,
    apellido: custodiado.apellido,
    telefono: custodiado.telefono,
    direccion: custodiado.direccion,
    fecha_nacimiento: custodiado.fecha_nacimiento,
    email: custodiado.email,
    cedula: custodiado.cedula,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [blockedTime, setBlockedTime] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const checkBlockedTime = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/auth/check-blocked/${formData.cedula}`);
        if (response.data.blocked) {
          const remainingTime = response.data.remainingTime;
          setBlockedTime(remainingTime);
        }
      } catch (error) {
        console.error('Error verificando el tiempo de bloqueo:', error);
      }
    };

    if (otpSent) {
      checkBlockedTime();
    }
  }, [otpSent, formData.cedula]);

  const sendOtp = async () => {
    try {
      await axios.post(
        `http://localhost:3000/api/v1/auth/send-otp`,
        { email: formData.email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOtpSent(true);
      setErrorMessage('');
    } catch (error) {
      console.error('Error al enviar el OTP:', error);
      setErrorMessage('Error al enviar el OTP. Por favor, inténtalo de nuevo.');
    }
  };

  const verifyOtpAndSubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/auth/verify-otp-custodiado`,
        { email: formData.email, otp },
        {headers: {
            Authorization: `Bearer ${token}`,
          },});
      if (response.data.success) {
        await axios.put(
          `http://localhost:3000/api/v1/usuarios/cedula/${formData.cedula}`,
          {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            direccion: formData.direccion,
            fecha_nacimiento: formData.fecha_nacimiento,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        navigate('/datos-custodiados');
      } else {
        setErrorMessage('OTP incorrecto. Por favor, verifica e inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al verificar OTP:', error);
      setErrorMessage('OTP incorrecto o expirado. Por favor, intenta nuevamente.');
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();

    if (blockedTime) {
      setErrorMessage(`Cuenta bloqueada temporalmente. Intenta nuevamente en ${blockedTime} minutos.`);
      return;
    }

    if (!otpSent) {
      await sendOtp();
    } else {
      await verifyOtpAndSubmit();
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setErrorMessage('');
  };

  const handleBack = () => {
    navigate('/datos-custodiados');
  };

  return (
    <div className="editar-datos-container">
      <h1>Editar Datos del Custodiado</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            disabled={otpSent}
          />
        </div>
        <div>
          <label>Apellido</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleInputChange}
            disabled={otpSent}
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            disabled={otpSent}
          />
        </div>
        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            disabled={otpSent}
          />
        </div>
        <div>
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleInputChange}
            disabled={otpSent}
          />
        </div>
        <div>
          <label>Correo</label>
          <input type="email" name="email" value={formData.email} readOnly />
        </div>
        <div>
          <label>Cédula</label>
          <input type="text" name="cedula" value={formData.cedula} readOnly />
        </div>

        {otpSent && (
          <div>
            <label>Ingresa el OTP que recibiste por correo</label>
            <input type="text" name="otp" value={otp} onChange={handleOtpChange} required />
          </div>
        )}

        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

        <button type="submit">{otpSent ? 'Verificar OTP y Guardar Cambios' : 'Enviar OTP'}</button>

        <button type="button" onClick={handleBack} style={{ marginLeft: '10px' }}>
          Volver a Datos Custodiados
        </button>
      </form>
    </div>
  );
};

export default EditarDatosCustodiados;
