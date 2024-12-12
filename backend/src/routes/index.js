const express = require('express');
const authRouter = require('./auth.routes'); 
const usuarioRouter = require('./usuario.routes'); 

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/auth', authRouter); 
    router.use('/usuarios', usuarioRouter);
}

module.exports = routerApi;