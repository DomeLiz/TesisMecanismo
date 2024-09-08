const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
// Configuración de CORS
app.use(cors({
    //origin: 'http://localhost:3001' // Permite solicitudes desde el frontend
    origin: 'https://controlpii.surge.sh'
}));

const port = process.env.PORT || 3000;

const routerApi = require('./routes');

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send('Backend con NodeJs - Express + CRUD API REST + SQL');
});

routerApi(app);

app.listen(port, ()=>{
    console.log("Port ==> ", port);
});
