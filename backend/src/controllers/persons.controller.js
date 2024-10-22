//metodos para cceder a la base
const PersonsService = require('../service/persona.service');
const service = new PersonsService();

const { sendOTP } = require('../mailer');
const otpStore = {};

// Enviar OTP al correo
const sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generar un código OTP de 6 dígitos

    try {
        // Guardar el OTP temporalmente
        otpStore[email] = otp;

        // Enviar el OTP al correo
        await sendOTP(email, otp);
        res.json({ success: true, message: 'OTP enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar OTP:', error);
        res.status(500).json({ success: false, message: 'Error al enviar OTP' });
    }
};

// Verificar OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (otpStore[email] && otpStore[email] == otp) {
            // OTP correcto, eliminar del almacenamiento temporal
            delete otpStore[email];
            res.json({ success: true, message: 'OTP verificado correctamente' });
        } else {
            res.status(400).json({ success: false, message: 'OTP incorrecto' });
        }
    } catch (error) {
        console.error('Error al verificar OTP:', error);
        res.status(500).json({ success: false, message: 'Error al verificar OTP' });
    }
};


const create = async (req, res) => {
    try {
        const response = await service.create(req.body);
        res.json({ success: true, data: response});
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const getByCedula = async (req, res) => {
    try {
        const { cedula } = req.params; // Asegúrate de que estás obteniendo la cédula de los parámetros
        if (!cedula) {
            return res.status(400).send({ success: false, message: 'Cédula es requerida.' });
        }

        const response = await service.findByCedula(cedula); // Llama al método correcto
        res.json(response); // Devuelve la respuesta
    } catch (error) {
        console.error('Error en getByCedula:', error.message); // Mensaje de error más detallado
        res.status(500).send({ success: false, message: error.message });
    }
}


const update = async (req, res) => {
    try {
        const { cedula } = req.params; // Cambia de id a cedula
        const body = req.body;
        const response = await service.update(cedula, body); // Usa cedula aquí
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const _delete= async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.delete(id);
        res.json(response);
    } catch ( error) {
        res.status(500).send({ success: false, message: error.message});
    }
}

const assignCustodian = async (req, res) => {
    try {
        const { personId, custodianId } = req.body;

        // Verificar que no se asigna a sí mismo como custodio
        if (personId === custodianId) {
            return res.status(400).send({ success: false, message: 'No puedes asignarte a ti mismo como custodio.' });
        }

        // Lógica para asignar custodio (puedes guardar la relación en una tabla adicional si es necesario)
        const response = await service.assignCustodian(personId, custodianId);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getCustodian = async (req, res) => {
    const cedula = req.params.cedula;

    try {
        const custodio = await service.findCustodianByCedula(cedula);
        if (!custodio) {
            return res.status(404).json({ message: 'No hay custodio asignado para esta persona.' });
        }
        res.json({
            custodian: true,
            custodianName: custodio.name,
            custodianCedula: custodio.cedula,
        });
    } catch (error) {
        console.error('Error en getCustodian:', error.message); // Agregar logging para depuración
        res.status(500).json({ message: 'Error al obtener custodio: ' + error.message });
    }
};


const removeCustodian = async (req, res) => {
    try {
        const { cedula } = req.params;
        // Llamar al servicio para eliminar el custodio
        const response = await service.removeCustodian(cedula);
        res.json({ success: true, message: 'Custodio eliminado exitosamente', data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getCustodiados = async (req, res) => {
    const { custodianCedula } = req.params;

    try {
        const custodians = await service.findCustodiadosByCustodianCedula(custodianCedula); // Asegúrate de que este método esté implementado en tu servicio
        if (!custodians || custodians.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron personas que tengan asignado este custodio.' });
        }
        res.json({ success: true, custodians });
    } catch (error) {
        console.error('Error en getCustodiados:', error.message);
        res.status(500).json({ success: false, message: 'Error al obtener los custodiados: ' + error.message });
    }
};




module.exports = {
    create,
    get,
    getById,
    update,
    _delete,
    getByCedula,
    assignCustodian, 
    getCustodian,
    removeCustodian,
    getCustodiados,
    sendOtp,
    verifyOtp
};

