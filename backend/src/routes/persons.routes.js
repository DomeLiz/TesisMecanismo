const express = require('express');
const router = express.Router();
const personsController = require('../controllers/persons.controller');

router
    .get('/', personsController.get)
    .get('/:id', personsController.getById)
    .get('/cedula/:cedula', personsController.getByCedula)
    .post('/', personsController.create)
    .put('/cedula/:cedula', personsController.update)
    .delete('/:id', personsController._delete)
    .post('/assign-custodian', personsController.assignCustodian)
    .get('/:cedula/custodian', personsController.getCustodian)
    .delete('/custodian/:cedula', personsController.removeCustodian)
    .get('/custodian/:custodianCedula/custodiados', personsController.getCustodiados)
    .post('/send-otp', personsController.sendOtp)
    .post('/verify-otp', personsController.verifyOtp);


module.exports = router;