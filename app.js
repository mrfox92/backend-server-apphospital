/* Requires: es una librería de terceros que se utiliza para ciertas funcionalidades */

var express = require('express');

/* hacemos referencia a la libreria mongoose */
var mongoose = require('mongoose');

/* Node.js body parsing middleware. */
var bodyParser = require('body-parser');

/* inicializar variables */

var app = express();

/* parse application/x-www-form-urlencoded
cuando el bodyparser ve que entra una petición esta pasará por el bodyparser,
este la toma y nos crea el objeto javascript para utilizarlo */
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

/* importar rutas */

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

/* Conexión a la base de datos */

mongoose.connection.openUri('mongodb://localhost:27017/hospiralDB', (err, res) => {
    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

/* Rutas: ejecutamos un middleware, este se ejecuta antes de que se ejecuten otras rutas */
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

/* Escuchar peticiones */

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});