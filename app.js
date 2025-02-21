const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const User1 = require('./models/user1');
const Izreke = require('./models/izreke');
const Pitanja = require('./models/pitanja');
const Izazovi = require('./models/izazovi');
const Poruke = require('./models/poruke');
const Dezeni = require('./models/dezen');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
//const sgMail = require('@sendgrid/mail');
//sgMail.setApiKey(process.env.SENDGRID_API_KEY);


function deleteFileByName(filenameWithoutExtension) {

  const extensions = ['.jpg', '.jpeg', '.png', '.heif', '.heic', '.webp'];

  extensions.forEach(extension => {
    const filePath = path.join(__dirname, 'public/uploads', filenameWithoutExtension + extension);
    
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(`Error deleting file with extension ${extension}:`, err);
      } else {
        console.log(`File with extension ${extension} deleted successfully!`);
      }
    });
  });
}


const storage = multer.diskStorage(            
  {
    destination: './public/uploads/',
    filename: function(req, file, cb){
      const id = req.id;
      cb(null, id + path.extname(file.originalname));
    }
  }
);

const upload = multer(
  {
    storage: storage,
    limits: {fileSize: 200000000},
    fileFilter: function(req, file, cb){
      const imeEkstenzije = /jpg|jpeg|png|heif|heic|webp/;
      const mozeProci = imeEkstenzije.test(path.extname(file.originalname).toLowerCase());
      const mimetype = imeEkstenzije.test(file.mimetype);
      if(mozeProci && mimetype){ return cb(null, true); }else{ return cb('Error: images only!'); }
    }
  }
).single('file.nameOdInputa');

const PORT = process.env.PORT || 3000;

const app = express();
const dburl = 'mongodb+srv://ozezi444:ozegoh55555@clusterteglice.64skg.mongodb.net/?retryWrites=true&w=majority&appName=ClusterTeglice';
mongoose.connect(dburl)
 .then((result)=>{app.listen(PORT, '0.0.0.0');console.log('connected to db');})
 .catch((err)=>{console.log(err);});

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.set('view engine','ejs');


const auten = (req , res , next) => {
  const Token = req.cookies.jwt;
  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',(err , encodedToken)=>{
      if(err){
        res.redirect('/index');
      }else{
        console.log(encodedToken);
        next();
      }
    });
  }else{
    res.redirect('/index');
  } 
}


app.get('/index' , function(req , res){
  res.sendFile('./index.html', {root: __dirname});
});


app.get('/signin' , function(req , res){
  res.sendFile('./signin.html', {root: __dirname});
});


app.post('/signin' , async function(req , res){
  let imess='';
  let passmess='';
  const inputime = req.body.inputime;
  const inputpass = req.body.inputpass;

  try {
    const user = await User.create({nickname:inputime , password:inputpass});
    const token = jwt.sign({id:user._id} , 'bile jednom davno tri svinje');
    res.cookie('jwt' , token , {httpOnly: false , maxAge: 1000*60*60*24});
    res.json({imess, passmess, inputime});
  } catch (err) {
    if(err.message.includes('Please insert an username')){
      imess = 'Please insert an username';
    }else if(err.message.includes('Maximum username length is 10')){
      imess = 'Maximum username length is 10';
    }else if(err.code === 11000){
      imess = 'This name is already taken';
    }

    if(err.message.includes('Please insert an password')){
      passmess = 'Please insert an password';
    }else if(err.message.includes('Minimum password length is 6')){
      passmess = 'Minimum password length is 6';
    }else if(err.message.includes('Maximum password length is 20')){
      passmess = 'Maximum password length is 20';
    }
    res.json({imess, passmess});
  }
});


app.get('/login' , function(req , res){
  res.sendFile('./login.html', {root: __dirname});
});


app.post('/login' , async function(req , res){
  let imess='';
  let passmess='';
  const inputime = req.body.inputime;
  const inputpass = req.body.inputpass;

  try {
    const user = await User.login(inputime , inputpass);
    const token = jwt.sign({id:user._id}, 'bile jednom davno tri svinje');
    res.cookie('jwt' , token , {httpOnly: false , maxAge: 1000*60*60*24});
    res.json({imess, passmess, inputime});
    } catch (err) {
      if(err.message === 'Incorect nickname'){ imess = 'Incorect nickname'; }
      if(err.message === 'Incorect password'){ passmess = 'Incorect password'; }
      res.json({imess, passmess});
  }
});


app.post('/podaci' , async function(req , res){
  try {
    const pitanja = await Pitanja.find();
    const izreke = await Izreke.find();
    const izazovi = await Izazovi.find();
    const poruke = await Poruke.find();
    const dezeni = await Dezeni.find();
    res.json({ izreke: izreke, pitanja: pitanja , izazovi: izazovi, poruke: poruke, dezeni: dezeni});
  } catch (err) {
      console.log(err);
  }   
});

//DODAVANJE
app.post('/adminPanelIzreke' , async function(req , res){

  const izreke = req.body.izreke;
  const za = req.body.za;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try {
            const izreka = await Izreke.create({ izreke: izreke, za: za });
            res.json({ izreka });
          } catch (err) {
              console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 

});


app.post('/adminPanelPitanja' , async function(req , res){

  const pitanja = req.body.pitanja;
  const za = req.body.za;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try {
            const pitanje = await Pitanja.create({ pitanja: pitanja, za: za });
            res.json({ pitanje });
          } catch (err) {
              console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 

});

/*
app.post('/adminPanelIzazovi' , async function(req , res){

  const izazovi = req.body.izazovi;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try {
            const izazov = await Izazovi.create({ izazovi: izazovi });
            res.json({ izazov });
          } catch (err) {
              console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 

});
*/

app.post('/adminPanelPoruke' , async function(req , res){

  const poruke = req.body.poruke;
  const za = req.body.za;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try {
            const poruka = await Poruke.create({ poruke: poruke, za: za });
            res.json({ poruka });
          } catch (err) {
              console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 

});

//POSILJKA
app.post('/posiljka' , async function(req , res){

  const ime = String(req.body.ime).trim();
  const mesto = String(req.body.mesto).trim();
  const ulica = String(req.body.ulica).trim();
  const postanski = String(req.body.postanski).trim();
  const telefon = String(req.body.telefon).trim();
  const email = req.body.email;
  const izreke = req.body.izreke;
  const pitanja = req.body.pitanja;
  const poruka = req.body.poruka;
  const dezen = req.body.dezen;
  const linkic = req.body.linkic;
  const tip = req.body.tip;
  const za = req.body.za;
  //const vreme = req.body.vreme;
  const now = new Date();
  const dayNames = ["Nedeljа", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
  const monthNames = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", 
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
  const dayOfWeek = dayNames[now.getDay()];
  const day = now.getDate();
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const vreme = `${dayOfWeek}, ${day} ${month} ${year}. ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
/*
  if(email){
      const msg = {
        to: email,  // Primaoci
        from: 'noreply@yourdomain.com',  // Pošiljalac
        subject: 'Test Email from Node.js with SendGrid',
        text: 'This is a test email sent using SendGrid!'
      };

      sgMail.send(msg)
        .then(() => {
          console.log('Email sent successfully!');
        })
        .catch((error) => {
          console.error(error);
        });
  }*/
  
  if(ime && mesto && ulica && postanski && telefon){
    try {
      if(tip == 'kutija'){
        const user1 = await User1.create({
          ime: ime,
          mesto: mesto, 
          ulica: ulica, 
          postanski: postanski,  
          telefon: telefon, 
          email: email, 
          izreke: izreke, 
          pitanja: pitanja,
          linkic: linkic,
          vreme: vreme,
          tip: tip,
          za: za
        });
        res.json({user1});
      }else if(tip == 'boca'){
        const user1 = await User1.create({
          ime: ime,
          mesto: mesto, 
          ulica: ulica, 
          postanski: postanski,  
          telefon: telefon, 
          email: email, 
          poruka: poruka, 
          dezen: dezen,
          vreme: vreme,
          tip: tip,
          za: za 
        });
        res.json({user1});
      }
    } catch (err) {
      console.log(err);
      if(err.message.includes('Morate uneti ime i prezime')){
        res.json({greska: 'Morate uneti ime i prezime'});
      }else if(err.message.includes('Morate uneti mesto')){
        res.json({greska: 'Morate uneti mesto'});
      }else if(err.message.includes('Morate uneti ulicu i broj')){
        res.json({greska: 'Morate uneti ulicu i broj'});
      }else if(err.message.includes('Maximum za')){
        res.json({greska: 'Maximum za nesto je premasen'});
      }else if(err.message.includes('Morate uneti vreme porucivanja')){
        res.json({greska: 'Morate uneti vreme porucivanja'});
      }else if(err.message.includes('Morate uneti tip poklona')){
        res.json({greska: 'Morate uneti tip poklona'});
      }else if(err.message.includes('Morate uneti za koga je polon')){
        res.json({greska: 'Morate uneti za koga je polon'});
      }
    }
  }
});


app.post('/posiljkaPodaci' , async function(req , res){

  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try{
            const user1 = await User1.find();
            res.json({user1});
          }catch(err){
            console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});


app.post('/posiljkaBrisi' , async function(req , res){
  
  const id = req.body.id;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try{
            const user1 = await User1.deleteOne({_id: id});
            deleteFileByName(id);
            res.json({id});
          }catch(err){
            console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});

//BRISANJE
app.post('/brisiIzreku' , async function(req , res){
  
  const ids = req.body.id;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try{
            //const izreka = await Izreke.deleteOne({_id: id});
            const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
            const result = await Izreke.deleteMany({
              _id: { $in: objectIds }
            });
            res.json({ids: ids});
          }catch(err){
            console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});


app.post('/brisiPitanje' , async function(req , res){
  
  const ids = req.body.id;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try{
            const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
            const result = await Pitanja.deleteMany({
              _id: { $in: objectIds }
            });
            res.json({ids: ids});
          }catch(err){
            console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});


app.post('/brisiIzazov' , async function(req , res){
  
  const ids = req.body.id;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try{
            //const izreka = await Izreke.deleteOne({_id: id});
            const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
            const result = await Izazovi.deleteMany({
              _id: { $in: objectIds }
            });
            res.json({ids: ids});
          }catch(err){
            console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});


app.post('/brisiPoruku' , async function(req , res){
  
  const ids = req.body.id;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try{
            //const izreka = await Izreke.deleteOne({_id: id});
            const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
            const result = await Poruke.deleteMany({
              _id: { $in: objectIds }
            });
            res.json({ids: ids});
          }catch(err){
            console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});


app.post('/dezen' , async function(req , res){

  const Token = req.cookies.jwt;
  const ime = req.body.ime;
  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try {
            const dezen = await Dezeni.create({ ime: ime });
            res.json({dezen});
            console.log(dezen);
          } catch (err) {
            if(err.message.includes('Morate uneti ime')){
              res.json({greska: 'Morate uneti ime'});
            }
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});


app.post('/dezenBrisi' , async function(req , res){
  
  const id = req.body.id;
  const Token = req.cookies.jwt;

  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try{
            const dezen = await Dezeni.deleteOne({_id: id});
            deleteFileByName(id);
            res.json({id});
          }catch(err){
            console.log(err);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});


app.post('/upload', async (req, res) => {
  const id = req.query.id;
  let extenzija = '';
  req.id = id;
  try {
    const document = await User1.findById(id);
    if (document) {
      upload(req, res, async (err)=>{
        if(req.file){
          extenzija = path.extname(req.file.originalname);
          const result = await User1.updateOne(
            { _id: id }, 
            { $set: { extenzija: extenzija } } 
          );
          if(result.modifiedCount > 0){}else{ deleteFileByName(id); }
          if(err){}else{ console.log(req.file); }
          }
        }
      );
    }else{
      console.log('Document not found');
    }
  } catch (error) {
    console.error('Error fetching document:', error);
  }
});


app.post('/uploadAdmin', async (req, res) => {
  const id = req.query.id;
  let extenzija = '';
  req.id = id;
  const Token = req.cookies.jwt;
  if(Token){
    jwt.verify(Token , 'bile jednom davno tri svinje',async (err , encodedToken)=>{
      if(err){
        console.log(err);
      }else{
        const user = await User.findOne({_id: encodedToken.id});
        if(user.nickname == 'Andreja'){
          try {
            const document = await Dezeni.findById(id);
            if (document) {
              upload(req, res, async (err)=>{
                if(req.file){
                  extenzija = path.extname(req.file.originalname);
                  const result = await Dezeni.updateOne(
                    { _id: id }, 
                    { $set: { extenzija: extenzija } } 
                  );
                  if(result.modifiedCount > 0){}else{ deleteFileByName(id); }
                  if(err){const result = Dezeni.findByIdAndDelete(id);}else{ console.log(req.file); }
                }else{
                    const result = Dezeni.findByIdAndDelete(id);
                } 
              });
            }else{
              console.log('Document not found');
            }
          } catch (error) {
            console.error('Error fetching document:', error);
          }
        }else{
          console.log('Niste administrator');
        }  
      }
    });
  }else{
    console.log('Niste ulogovani');
  } 
});