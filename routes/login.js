/* importamos express */
var express = require('express');
/* bcryptjs */
var bcrypt = require('bcryptjs');
/* JWT */
var jwt = require('jsonwebtoken');
/* recibimos el SEED desde nuestro archivo de configuraciones */
var SEED = require('../config/config').SEED;
/* importamos nuestro client id */
var CLIENT_ID = require('../config/config').CLIENT_ID;
/* levantamos la app con express */
var app = express();

/* importamos nuestro esquema de usuario */
var Usuario = require('../models/usuario');
//Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/*Nota: normalmente google recomienda que las peticiones o validaciones se hagan por medio de un post */
// ===================================================
//  Autenticación Google
// ===================================================
/* verificamos el token del usuario a traves de la funcion verify, la cual devuelve una promesa */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
app.post('/google', async(req, res) => {
    var token = req.body.token;
    /* espearamos por la respuesta de la función verify() */
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });
    /* verificamos si el correo es de usuario válido */
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            /* verificamos si se ha autenticado con google */
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticacion normal'
                });
            } else {
                /* genero un nuevo token */
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            /* el usuario no existe... hay que crearlo */
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            /* guardamos el usuario */
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: err
                    });
                }
                /* Generamos un nuevo token de acceso */
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            });
        }
    });
    /* return res.status(200).json({
        ok: true,
        mensaje: 'Ok!!',
        googleUser: googleUser
    }); */
});
// ===================================================
//  Autenticacion normal
// ===================================================
/* metodo de login */
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al busca usuario',
                errors: err
            });
        }
        /* verificando email */
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        /* verificando password */
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        /* Crear un token!! */
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });
});

function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                //  { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        //  unshift inserta un nuevo elemento al comienzo de un arreglo
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }
    return menu;
}

/* exportamos nuestro archivo */
module.exports = app;