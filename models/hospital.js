/* importamos la librería mongoose para el manejo de nuestra DB  con mongo*/
var mongoose = require('mongoose');

/* definimos un schema */
var Schema = mongoose.Schema;

/* definimos el esquema hospital */
var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });

/* exportamos nuestro modelo */
module.exports = mongoose.model('Hospital', hospitalSchema);