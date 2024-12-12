const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { Usuario, OTP } = require('../db/models'); 
router
    .post('/register', UsuarioController.crearUsuario)
    .get('/', UsuarioController.find)
    .get('/:id', UsuarioController.findOne)
    .get('/cedula/:cedula', UsuarioController.findByCedula)
    .put('/cedula/:cedula', UsuarioController.update)
    .delete('/:id', UsuarioController._delete)
    .post('/assign-custodian', UsuarioController.assignCustodian)
    .get('/get-custodian/:cedula', UsuarioController.getCustodian)
    .delete('/eliminar-custodio/:cedula', UsuarioController.eliminarCustodio)
    .get('/custodiados/:cedula', UsuarioController.getCustodiados)
    
   ;
    module.exports = router;
