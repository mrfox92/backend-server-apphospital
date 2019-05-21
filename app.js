/* Requires: es una librería de terceros que se utiliza para ciertas funcionalidades */

var express = require('express');

/* hacemos referencia a la libreria mongoose */
var mongoose = require('mongoose');

/* Node.js body parsing middleware. */
var bodyParser = require('body-parser');

/* inicializar variables */

var app = express();

/* CORS */
app.use(function(req, res, next) {
    /* origen de datos: cualquier lugar va poder hacer las peticiones */
    res.header("Access-Control-Allow-Origin", "*");
    /* los tipos de origenes permitidos */
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    /* peticiones permitidas */
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

/* parse application/x-www-form-urlencoded
cuando el bodyparser ve que entra una petición esta pasará por el bodyparser,
este la toma y nos crea el objeto javascript para utilizarlo */
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

/* importar rutas */

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');

/* Conexión a la base de datos */

mongoose.connection.openUri('mongodb://localhost:27017/hospiralDB', (err, res) => {
    if (err)
        throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

/* Server index config: permite si un usuario conoce parte de la ruta poder ver todos los
archivos de los directorios internos de la ruta */
/* var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'));
app.use('/uploads', serveIndex(__dirname + '/uploads')); */

/* Rutas: ejecutamos un middleware, este se ejecuta antes de que se ejecuten otras rutas */
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

/* Escuchar peticiones */

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});