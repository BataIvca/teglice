const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
  pitanja: {
    type: String,
    maxlength: [250 , "Maximum username length is 250"],
    required: [true , "Morate uneti pitanje"]
  },
  za: {
    type: String,
    required: [true , "Morate uneti za koga je"]
  }
});

const Pitanja = mongoose.model('pitanja',userschema);

module.exports = Pitanja;