/* importamos express */
var express = require('express');
/* levantamos la app con express */
var app = express();
/* importamos nuestro modelo medico */
var Medico = require('../models/medico');
/* middleware autenticacion */
var mdautenticacion = require('../middlewares/autenticacion');

/* definimos las peticiones http  de nuestro servicio */

/* obtener todos los medicos */

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    /* hardcodeamos nuestra variable desde para que explícitamente sea un número lo que recibe
    como parametro */
    desde = Number(desde);
    /* buscamos todos los medicos */
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});


/* crear nuevo medico */

app.post('/', mdautenticacion.verificarToken, (req, res) => {
    /* recibimos la data que viene desde el formulario */
    var body = req.body;
    /* instanciamos e incializamos un objeto de nuestro modelo de medicos */
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    /* guardamos el nuevo medico creado */
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});


/* actualizar informaciÃ³n mÃ©dico */
app.put('/:id', mdautenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    /* buscamos el medico por su id */
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `el medico con el id ${ id } no existe`,
                errors: { message: 'no existe medico con ese id' }
            });
        }
        /* si todo va bien actualizamos la data del medico */
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        /* guardamos los cambios en la base de datos */
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            return res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

/* eliminar medico */

app.delete('/:id', mdautenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    /* buscamos el medico por su id y eliminarlo */
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: { message: 'No existe medico con ese id' }
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

/* exportamos nuestro archivo de rutas medico */
module.exports = app;