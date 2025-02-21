const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
  izazovi: {
    type: String,
    maxlength: [100 , "Maximum username length is 100"],
    required: [true , "Morate uneti izazov"],
    default: undefined
  }
});

const Izazovi = mongoose.model('izazovi',userschema);

module.exports = Izazovi;