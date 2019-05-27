/* importamos express */
var express = require('express');
/* levantamos la app con express */
var app = express();
/* importamos nuestro modelo hospital*/
var Hospital = require('../models/hospital');
/* middleware autenticacion */
var mdautenticacion = require('../middlewares/autenticacion');

/* Definimos nuestras peticiones http */

/* Obtener todos los hospitales */
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    var todo = req.query.todo || false;
    //  Añadir servicio para cargar todos los hospitales al selector html
    /* hardcodeamos nuestra variable desde para que explicitamente sea un n?mero lo que recibe
    como parametro */
    desde = Number(desde);
    todo = Boolean(todo);
    /* buscamos todos los hospitales */
    if (todo) {
        Hospital.find({})
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
    } else {
        Hospital.find({})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
    }
});

//  ======================================
//  Obtener Hospital por ID
//  ======================================

app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El hospital con el id ${ id } no existe`,
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

/* crear nuevo hospital */
app.post('/', mdautenticacion.verificarToken, (req, res) => {
    var body = req.body;
    /* creamos una instancia de nuestro modelo Hospitales, e inicializamos sus propiedades */
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    /* guardamos el hospital */
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

/* actualizar informacion hospital */
app.put('/:id', mdautenticacion.verificarToken, (req, res) => {
    /* obtenemos el id del hospital a actualizar */
    var id = req.params.id;
    /* obtenemos la data a actualizar */
    var body = req.body;
    /* verificamos si es un id válido */
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${ id } no existe`,
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        /* actualizamos la data si todo marcha bien */
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        /* Grabamos los datos */
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            /* si no hay errores entonces actualizamos correctamente */

            return res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

/* Eliminar un hospital */
app.delete('/:id', mdautenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: { message: 'No existe hospital con ese id' }
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

/* exportamos nuestro archivo de rutas hospital */
module.exports = app;