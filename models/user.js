const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userschema = new mongoose.Schema({
  nickname:{
    type: String,
    required: [true , "Please insert an username"],
    unique: true,
    maxlength: [10 , "Maximum username length is 10"]
    },
  password:{
    type: String,
    required: [true , "Please insert an password"],
    minlength: [6 , "Minimum password length is 6"],
    maxlength: [20 , "Maximum password length is 20"]
  }
});

userschema.pre('save' , async function(next){
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password , salt);
  next();
})

userschema.statics.login = async function(nickname , password){
  const user = await this.findOne({nickname: nickname});
  if(user){const auth = await bcrypt.compare(password , user.password);
  if(auth){return user;
  }throw Error('Incorect password');
}throw Error('Incorect nickname');
}

const User = mongoose.model('user',userschema);

module.exports = User;