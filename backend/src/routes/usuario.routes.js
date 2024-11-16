const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');

router
    .post('/register', UsuarioController.crearUsuario)
    .get('/', UsuarioController.find)
    .get('/:id', UsuarioController.findOne)
    .get('/cedula/:cedula', UsuarioController.findByCedula)
    .put('/cedula/:cedula', UsuarioController.update)
    .delete('/:id', UsuarioController.delete)
    .post('/assign-custodian', UsuarioController.assignCustodian);
module.exports = router;
