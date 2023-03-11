// //jshint esversion:6
// require('dotenv').config();

// const express = require("express");
// const jwt = require("jsonwebtoken")
// const bodyparser = require("body-parser");
// const ejs = require("ejs");
// const { v4: uuidv4 } = require('uuid');
// var md5 = require('md5');
// const mongoose = require("mongoose");
// const session = require("express-session")
// const passport = require("passport");
// const passportlocalmongoose = require("passport-local-mongoose")
// const path = require("path");

// const app = express();
// const cors = require("cors");
// const PORT = process.env.PORT || 3001;
// const ObjectId = require("mongodb").ObjectId;
// mongoose.connect(process.env.DBURL, {
//   useNewUrlParser: true,
// });


// var CurrentUser ;
 
// const momentschema = new mongoose.Schema({
//   createdTime:String,
//   u_id:String,
//   date: String ,
//   time : String,
//   place:String,
//   color:String,
//   saw:String,
//   response:String, 
// })
// const userschema = new mongoose.Schema({
//   u_id:String,
//   email:String,
//   username:String,
//   password:String,
// })
// console.log(path);


// userschema.plugin(passportlocalmongoose);
// const Moment = new mongoose.model("Moment",momentschema);
// const User = new mongoose.model("User",userschema);

// passport.use(User.createStrategy());

// passport.serializeUser(function(user,done){
//     done(null,user.id);
// })
// passport.deserializeUser(function(id,done){
//     User.findById(id,function(err,user){
//         done(err,user);
//     })
// })

// app.set("view engine","ejs");
// app.use(bodyparser.urlencoded({extended:true}));
// app.use(express.static("public"));
// // app.use(cors({credentials:true,origin:"https://crushie-moments.netlify.app/" || "http://localhost:3000"}));
// app.use(cors()); 
// app.use(express.json());
// app.use(session({
//   secret:process.env.SECRETKEY ,
//   resave:false,
//   saveUninitialized:false
// }));
// app.use(passport.session());

// app.post("/register",function(req,res){
//   User.register({u_id:uuidv4(),username :req.body.username,email:req.body.email},req.body.password,function(err,user){
//     if (err) {
//       console.log(err);
//       res.sendStatus(500);
//       return;
//   }
//     else{
//         passport.authenticate("local")(req,res,function(){
//           jwt.sign({user},process.env.SECRETKEY,(err,token)=>{

//               res.json({token : token,user:user});
//              });
//         })
//     }
// })
// });

// app.post("/login",function(req,res){
//   // const email = req.body.email;
//   const username = req.body.username;
//   const password = req.body.password;

//   const user = new User({
//     username:username,
//     password:password ,
//   });
 
//   req.login(user,function(err){
//     if (err) {
//       console.log(err);
//       res.sendStatus(500);
//       return;
//   }
//     else{
//         passport.authenticate("local")(req,res,function(){

//            jwt.sign({user},process.env.SECRETKEY,(err,token)=>{
//             User.findOne({username:username},function(err,result){
//               if(err){
//                 console.log(err)
//               }else{
//                   res.json({token : token,user:result});
//               }
//              });
//            });
  
//         })
//     }
// })
// })

// // Verify Token
//   function verifyToken(req,res,next){
//     const bearerHeader = req.headers['authorization'];
//     if(typeof bearerHeader!=="undefined"){
//       const bearer = bearerHeader.split(" ");
//       const bearerToken = bearer[1];
//       req.token = bearerToken;
//       next();
//     }else{
//       res.sendStatus(403);
//     }
//   }

// app.get("/post/:uid",verifyToken,function(req,res){
//   const uid =req.params.uid;
//   console.log(uid);
//    jwt.verify(req.token,process.env.SECRETKEY,(err,authData)=>{
//     if(err){
//       res.sendStatus(403);
//     }else{
//       Moment.find({u_id:uid},function(err,results){
//         if(err){
//           console.log("Error Occured "+err);
//           window.alert(err);
//         }else if(results){
//           console.log(results);
//           res.json({results})
//         }
//       });
//     }
//    });
  
// });

// app.post("/post/:uid",verifyToken,function(req,res){

//   const uid =req.params.uid;
//   //  const createdTime = req.body.createdTime;
//    const date = req.body.date;
//    const time = req.body.time;
//    const place = req.body.place;
//    const color = req.body.color;
//    const saw = req.body.saw;
//    const response = req.body.response;
 
//   const moment = new Moment({
//     // createdTime:createdTime,
//     u_id:uid,
//     date:date,
//     time:time,
//     place:place,
//     color:color,
//     saw:saw,
//     response:response

// });

//      moment.save(function(err,result){
//       if (err) {
//         console.log(err);
//         // res.sendStatus(500);
//         // return;
//     }else{
//       res.json(result);
//     }
     
//     })
// })
// app.post("/edit/:postid",verifyToken,function(req,res){
//   const id =req.params.postid;
//   Moment.findOneAndUpdate({_id:ObjectId(id)},req.body,
// 		{ new: true, useFindAndModify: false },function(err,result){
//       if (err) {
//         console.log(err);
//         res.sendStatus(500);
//         return;
//     }
//     res.json(result);
   
//   })
// });


// app.delete("/post/:postid",verifyToken,function(req,res){
//   Moment.deleteOne({ _id:req.params.postid},function(err,message){
//     if (err) {
//       console.log(err);
//       res.sendStatus(500);
//       return;
//   }
//     res.json({message : "Moment Deleted Successfully!"});
//   })
// });

// app.use((err, req, res, next) => {
// 	console.error(err.stack);
// 	res.status(500).send(`Red Alert ${err.stack}`);
// });
// app.listen(PORT, function() {
//   console.log("Server is running on Port: " + PORT);
// });
