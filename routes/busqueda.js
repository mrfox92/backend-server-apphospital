/* importamos express */
var express = require('express');
/* levantamos la app con express */
var app = express();
/* importamos los modelos */
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var promesas = [
    { 'usuario': buscarUsuarios },
    { 'medico': buscarMedicos },
    { 'hospital': buscarHospitales }
];
// ==================================
// Busqueda específica ╭( ･ㅂ･)و
// ==================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    /* tabla = tabla.toLowerCase(); */
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son válidos para: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válida' }
            });
    }
    /* si todo marcha bien ejecutamos la función correspondiente para realizar la búsqueda */
    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});


// ==================================
// Busqueda general (´-ω-`)
// ==================================
app.get('/todo/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    /* crear expresion regular para busqueda*/
    var regex = new RegExp(busqueda, 'i');
    /* mandamos un arreglo de Promesas y si todas responden correctamente, entonces podemos
    disparar un .then(). Si una de las promesas falla manejamos el .catch()*/
    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            return res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});


/* busqueda por hospitales */
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

/* busqueda por médicos */
function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });

}

/* buscar usuarios por nombre y por email*/
function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err)
                } else {
                    resolve(usuarios);
                }
            });
    });
}
/* exportamos nuestro archivo de rutas */
module.exports = app;