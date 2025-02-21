const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
ime: {
    type: String,
    maxlength: [100 , "Maximum username length is 100"],
    required: [true , "Morate uneti ime"],
    default: undefined
  },
extenzija: {
    type: String,
    maxlength: [100 , "Maximum username length is 100"],
    default: undefined
  }
});

const Dezeni = mongoose.model('dezen',userschema);

module.exports = Dezeni;