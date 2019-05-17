/* importamos la librería mongoose */
var mongoose = require('mongoose');
/* definimos un Schema */
var Schema = mongoose.Schema;

/* definimos el esquema para nuestra coleccion de medicos */
var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, require: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El id hospital es un campo obligatorio']
    }
});

/* exportamos nuestro modelo */
module.exports = mongoose.model('Medico', medicoSchema);