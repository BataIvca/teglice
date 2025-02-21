const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
  vreme:{
    type: String,
    required: [true , "Morate uneti vreme porucivanja"],
    maxlength: [50 , "Maksimum za ovo polje je 50 slova"]
    },
  tip:{
    type: String,
    required: [true , "Morate uneti tip poklona"],
    maxlength: [30 , "Maksimum za tip poklona je 30 slova"]
    },
  za:{
    type: String,
    required: [true , "Morate uneti za koga je poklon"],
    maxlength: [30 , "Maksimum za ovo polje je 30 slova"]
    },
  ime:{
    type: String,
    required: [true , "Morate uneti ime i prezime"],
    maxlength: [30 , "Maksimum za ime je 30 slova"]
    },
  mesto:{
    type: String,
    required: [true , "Morate uneti mesto"],
    maxlength: [30 , "Maksimum za prezime je 30 slova"]
    },
  ulica:{
    type: String,
    required: [true , "Morate uneti ulicu i broj"],
    maxlength: [30 , "Maksimum za adresu je 30 slova"]
  },
  postanski:{
    type: String,
    required: [true , "Morate uneti postanski kod"],
    maxlength: [30 , "Maksimum za adresu je 30 slova"]
  },
  telefon:{
    type: String,
    required: [true , "Morate uneti broj telefona"],
    maxlength: [30 , "Maksimum za telefon je 30 slova"]
    },
  email:{
    type: String,
    maxlength: [30 , "Maksimum za email je 30 slova"]
    },
  izreke: [String],
  pitanja: [String],
  extenzija: {
    type: String,
    default: undefined
  },
  linkic: {
    type: String,
    default: undefined
  },
  poruka:{
    type: String,
    maxlength: [1000 , "Maksimum za poruku je 1000 slova"]
  },
  dezen:{
    type: String,
    maxlength: [100 , "Maksimum za id dezena je 100 slova"]
  }
});

const User1 = mongoose.model('user1',userschema);

module.exports = User1;