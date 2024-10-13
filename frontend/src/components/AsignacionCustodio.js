import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AsignacionCustodio = () => {
    const [cedulaAsignador, setCedulaAsignador] = useState('');
    const [cedulaCustodio, setCedulaCustodio] = useState('');
    const [nombreAsignador, setNombreAsignador] = useState('');
    const [nombreCustodio, setNombreCustodio] = useState('');
    const [mensajeAsignacion, setMensajeAsignacion] = useState('');
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const cedula = localStorage.getItem('cedula');
        if (cedula) {
            setCedulaAsignador(cedula);
            obtenerDatosUsuario(cedula);
            verificarCustodioAsignado(cedula);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Función para obtener los datos del usuario asignador
    const obtenerDatosUsuario = async (cedula) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/persons/cedula/${cedula}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNombreAsignador(response.data.name); // Asignar nombre del asignador
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            setError('No se pudo obtener la información del usuario.');
        }
    };

    // Función para obtener el custodio asignado
    const obtenerCustodio = async (cedula) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/persons/${cedula}/custodian`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data; // Retorna los datos del custodio
        } catch (error) {
            console.error('Error al obtener custodio:', error);
            throw new Error('Error al obtener custodio');
        }
    };

    // Verifica si ya hay un custodio asignado al usuario
    const verificarCustodioAsignado = async (cedula) => {
        try {
            const data = await obtenerCustodio(cedula);

            if (data.custodian) {
                setNombreCustodio(data.custodianName); // Asignar nombre del custodio
                setCedulaCustodio(data.custodianCedula); // Asignar cédula del custodio
                setMensajeAsignacion(`Este usuario (${nombreAsignador} - ${cedulaAsignador}) tiene como custodio a (${data.custodianName} - ${data.custodianCedula})`);
            } else {
                setMensajeAsignacion('No hay custodio asignado para este usuario.');
            }
        } catch (error) {
            console.error('Error al verificar custodio asignado:', error);
            setError('Error al verificar el custodio asignado.');
        }
    };

    // Maneja la asignación de un nuevo custodio
    const handleAssignCustodian = async (e) => {
        e.preventDefault();
        setError(null); // Resetea el error antes de iniciar

        if (!cedulaCustodio.trim()) {
            setError('Por favor, ingrese la cédula del custodio.');
            return;
        }

        // Verificar si el custodio existe antes de asignarlo
        try {
            const custodianResponse = await axios.get(`http://localhost:3000/api/v1/persons/cedula/${cedulaCustodio}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Si no se encuentra el custodio, mostrar un mensaje de error
            if (!custodianResponse.data) {
                setError('Custodio no encontrado en la base de datos.');
                return;
            }
        } catch (error) {
            setError('Error al verificar el custodio en la base de datos.');
            console.error('Error al verificar custodio:', error);
            return;
        }

        // Si el custodio existe, proceder a asignarlo
        try {
            const response = await axios.post('http://localhost:3000/api/v1/persons/assign-custodian', {
                personId: cedulaAsignador,
                custodianId: cedulaCustodio,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setMensajeAsignacion(`Custodio (${nombreCustodio} - ${cedulaCustodio}) asignado a (${nombreAsignador} - ${cedulaAsignador}) exitosamente.`);
                alert('Custodio asignado exitosamente');
                navigate('/inicio');
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error al asignar custodio');
            console.error('Error en la asignación de custodio:', error);
        }
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('token');
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
                {mensajeAsignacion && <p>{mensajeAsignacion}</p>}
                <form onSubmit={handleAssignCustodian}>
                    <div>
                        <label>Cédula del Custodio</label>
                        <input
                            type="text"
                            value={cedulaCustodio}
                            onChange={(e) => setCedulaCustodio(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Asignar Custodio</button>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </main>
        </div>
    );
};

export default AsignacionCustodio;
