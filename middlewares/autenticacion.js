/* JWT */
var jwt = require('jsonwebtoken');
/* recibimos el SEED desde nuestro archivo de configuraciones */
var SEED = require('../config/config').SEED;

/* verificacion del token: 
leemos el token que recibimos desde la url.
lo procesamos(vemos si es vÃ¡lido y si no ha expirado).
una vez validado continuamos. Todo esto lo realizamos por medio
de un middleware  */
//  ===========================
//  Verifica Token
//  ===========================
exports.verificarToken = function(req, res, next) {
    /* recibimos el toquen */
    var token = req.query.token;
    /* realizamos la comprobacion */
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        /* Este usuario se construye en base al token y se añade al request */
        req.usuario = decoded.usuario;
        next();
        /* return res.status(200).json({
            ok: true,
            decoded: decoded
        }); */
    });
};

//  ==================================
//  Verifica Admin o mismo usuario
//  ==================================
exports.verificarAdmin_o_MismoUsuario = function(req, res, next) {
    // usuario decodificado desde el token ---> es el usuario que está llevando a cabo la accion
    var usuario = req.usuario;
    //  obtenemos el id los parametros de la peticion
    var id = req.params.id;
    /* 
    1. Verificamos si el usuario que está autenticado y efectua la accion (actualizar)
    tiene privilegio de administrador.
    2. Verificamos si el usuario que está autenticado y que efectua la accion (actualizar) la hace
    sobre la información de su perfil (se está actualizando a si mismo, lo cual es permitido)
     */
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        /* El usuario es válido y debemos continuar ejecutando los dem?a procesos
        para esto utilizamos la instruccion next() */
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador ni es el mismo usuario' }
        });
    }
};

//  ===========================
//  Verifica Admin
//  ===========================
exports.verificarAdmin = function(req, res, next) {
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        /* El usuario es válido y debemos continuar ejecutando los dem?a procesos
        para esto utilizamos la instruccion next() */
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'No tiene los privilegios necesarios' }
        });
    }
};