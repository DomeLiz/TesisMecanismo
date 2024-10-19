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
            obtenerDatosUsuario(cedula, setNombreAsignador);
            verificarCustodioAsignado(cedula);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const obtenerDatosUsuario = async (cedula, setNombre) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/persons/cedula/${cedula}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNombre(response.data.name);
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
        }
    };

    const verificarCustodioAsignado = async (cedula) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/persons/${cedula}/custodian`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.custodian) {
                setNombreCustodio(response.data.custodianName);
                setCedulaCustodio(response.data.custodianCedula);
                setMensajeAsignacion(`Este usuario  tiene como custodio a (${response.data.custodianName} - ${response.data.custodianCedula})`);
            } else {
                setMensajeAsignacion('No hay custodio asignado para este usuario.');
            }
        } catch (error) {
            console.error('Error al verificar custodio asignado:', error);
            setError('Error al verificar el custodio asignado.');
        }
    };

    const handleAssignCustodian = async (e) => {
        e.preventDefault();
        setError(null);

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
                await obtenerDatosUsuario(cedulaCustodio, setNombreCustodio);
                setMensajeAsignacion(`Este usuario tiene como custodio a (${nombreCustodio} - ${cedulaCustodio})`);
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

    const handleRemoveCustodian = async () => {
        // Verificar si se ha asignado un custodio
        if (!cedulaCustodio) {
            setError('No hay un custodio asignado para eliminar.');
            return;
        }
    
        try {
            const response = await axios.delete(`http://localhost:3000/api/v1/persons/custodian/${cedulaAsignador}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.data.success) {
                setMensajeAsignacion('El custodio ha sido eliminado.');
                setNombreCustodio(''); // Limpiar el nombre del custodio
                setCedulaCustodio(''); // Limpiar la cédula del custodio
                alert('Custodio eliminado exitosamente');
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Error al eliminar el custodio');
            console.error('Error al eliminar el custodio:', error);
        }
    };
    

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
                {/* Mostrar mensaje de custodia asignada */}
                {mensajeAsignacion && <p>{mensajeAsignacion}</p>}

                {/* Botón para eliminar el custodio */}
                {cedulaCustodio && (
                    <button onClick={handleRemoveCustodian}>Eliminar Custodio</button>
                )}

                {/* Formulario de asignación */}
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
