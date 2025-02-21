const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
  poruke: {
    type: String,
    //validate: {
    //  validator: function(value) {
    //    const lines = value.split('\n');     
    //    return lines.length <= 15;
    //  },
    //  message: 'Tekst može imati najviše 5 redova.'
    //},
    maxlength: [1000 , "Maximum username length is 1000"],
    required: [true , "Morate uneti poruku"],
    default: undefined
  },
  za: {
    type: String,
    required: [true , "Morate uneti za koga je"]
  }
});

const Poruke = mongoose.model('poruke',userschema);

module.exports = Poruke;