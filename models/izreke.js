const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
  izreke: {
    type: String,
    maxlength: [250 , "Maximum username length is 250"],
    required: [true , "Morate uneti citat"]
  },
  za: {
    type: String,
    required: [true , "Morate uneti za koga je"]
  }
});

const Izreke = mongoose.model('izreke',userschema);

module.exports = Izreke;