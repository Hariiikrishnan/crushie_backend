import express from 'express';
import jwt from "jsonwebtoken";
import BudUser from "../models/budUsersModel.js";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";
import passport from "passport";
import passportlocalmongoose from "passport-local-mongoose";


import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';


import fs from "fs";
import axios from "axios";
// import GoogleStrategy from 'passport-google-oauth20'.Strategy;
import FacebookStrategy from "passport-facebook"
import SnapchatStrategy from "passport-snapchat";

import {upload,p_uid} from "../utils/uploadImage.js"

const app = express();
app.use(bodyparser.urlencoded({extended:true}));


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authUser = asyncHandler(async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  const user = new BudUser({
    username: username,
    password: password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    } else {
      passport.authenticate("local")(req, res, function () {
        jwt.sign({ user }, process.env.SECRETKEY, {expiresIn:"1h"}, (err, token) => {
          BudUser.findOne({ username: username }, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              if(result.challenge=="none"||result.challenge=="requested"){
                res.json({ token: token, user: result });
              }else{
                BudUser.find({username:result.challenge},function(err2,result2){
                  if(err2){
                    console.log("Error in 2nd phase of controller", err2)
                  }
                  res.json({msg:"sucess",token:token,user:result,challenger:result2})
                })
              }
            }
          });
        });
      });
    }
  });
});

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body)
    BudUser.register(
    { u_id: p_uid, username: req.body.username, email: req.body.email , maxLimit:req.body.maxLimit ,currentAmount:0, challenge:"none"},
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      } else {
        passport.authenticate("local")(req, res, function () {
          jwt.sign({ user }, process.env.SECRETKEY, (err, token) => {
            res.json({ token: token, user: user });
          });
        });
      }
    }
  );
});




// Facebook oAuth
passport.use(new FacebookStrategy({
  clientID: process.env.APP_ID,
  clientSecret: process.env.APP_SECRET,
  callbackURL: "http://localhost:3001/budgetize/users/auth/facebook/success",
  profileFields: ['id', 'displayName', 'photos', 'email']
},

function(accessToken, refreshToken, profile, cb) {

  console.log(profile);
  console.log(accessToken);
// To download profile image which was returned by facebook as download link
const download_image = (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        console.log(path.join(__dirname,"../images"));
        response.data
          .pipe(fs.createWriteStream(path.join(__dirname,"../images/"+profile.id+".jpg")))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );
  
  (async () => {
    try{
      let example_image_1 = await download_image(profile.photos[0].value,profile.id+".jpg");
  
      console.log(example_image_1.status); // true
      console.log(example_image_1.error); // ''
    }catch(error){
      console.log("Error ra venna",error)
    }
  
  })();
  

  BudUser.findOrCreate({ u_id: profile.id ,username:profile.displayName}, function (err, user) {
    // console.log(user)
    return cb(err, user);
  });
}
));

// Middlewares and functions of Facebook auth EndPoints. 
  const fbAuth =  passport.authenticate('facebook')

  const fbAuthMW =  passport.authenticate('facebook', { failureRedirect: '/login' })
  
  const fbAuthRedirect = (req,res)=>{
    res.send("Success")
  }

  // const magicLogin = new SnapchatStrategy.default();

  try {
    passport.use(new SnapchatStrategy.default({
    clientID: process.env.SNAP_APP_ID,
    clientSecret: process.env.SNAP_APP_SECRET,
    callbackURL: "http://localhost:3001/budgetize/users/auth/snapchat/callback",
    profileFields: ['id', 'displayName', 'bitmoji']
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log("inside callback")
    console.log(profile);
    console.log(accessToken);
    BudUser.findOrCreate({ u_id: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
  ));
} catch(error){
  console.log("Snap Error", error)
}
  console.log("outside callback");
  
const snapAuth=passport.authenticate('snapchat',{ scope: ['user.display_name', 'user.bitmoji.avatar'] });

const snapAuthMW=passport.authenticate('snapchat', { failureRedirect: '/login' })



// Friendly Challenge Handlers

const challengeHandler = asyncHandler(async(req,res)=>{
  console.log(req.body);
  BudUser.findOneAndUpdate({username:req.body.u_id1},
    {challenge:req.body.u_id2},
    { new: true, useFindAndModify: false },
    function (err1,result1){
      if(err1){
        console.log("Error Occured", err1)
      }
      // res.json(result)
      BudUser.findOneAndUpdate({username:req.body.u_id2},
        {challenge:req.body.u_id1},
        { new: true, useFindAndModify: false },
        function (err2,result2){
          if(err2){
            console.log("Error Occured", err2)
          }
          res.json({msg:"success",result1,result2})
        })
    })
})


const challengers = asyncHandler(async(req,res)=>{
  
})


export { authUser, registerUser ,fbAuth,fbAuthMW,fbAuthRedirect,snapAuth,snapAuthMW, challengeHandler};

