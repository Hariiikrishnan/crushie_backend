import express from "express";
import jwt from "jsonwebtoken";
import BudUser from "../models/budUsersModel.js";
import BudChallenge from "../models/budChallenge.js";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";
import passport from "passport";
import schedule from "node-schedule";
// import passportlocalmongoose from "passport-local-mongoose";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

import fs from "fs";
import axios from "axios";
// import GoogleStrategy from 'passport-google-oauth20'.Strategy;
// import FacebookStrategy from "passport-facebook"
// import SnapchatStrategy from "passport-snapchat";

import { upload, p_uid } from "../utils/uploadImage.js";
import Budget from "../models/budgetizeModel.js";
import { error } from "console";

const app = express();
app.use(bodyparser.urlencoded({ extended: true }));

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
        jwt.sign({ user }, process.env.SECRETKEY, (err, token) => {
          BudUser.findOne({ username: username }, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              if (
                result.challenger == "none" ||
                result.challenger == "requested"
              ) {
                res.json({ token: token, user: result });
              } else {
                BudUser.find(
                  { username: result.challenger },
                  function (err2, result2) {
                    if (err2) {
                      console.log("Error in 2nd phase of controller", err2);
                    }
                    BudChallenge.findOne(
                      { challenge_id: result.challenge_id },
                      function (err3, result3) {
                        if (err3) {
                          console.log(err3);
                        }
                        res.json({
                          msg: "sucess",
                          token: token,
                          user: result,
                          challenger: result2,
                          challengeData: result3,
                        });
                      }
                    );
                  }
                );
              }
            }
          });
        });
      });
    }
  });
});

const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  BudUser.register(
    {
      u_id: p_uid,
      username: req.body.username,
      email: req.body.email,
      maxLimit: req.body.maxLimit,
      currentAmount: 0,
      challenger: "none",
    },
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

// Friendly Challenge Handlers

const challengeHandler = asyncHandler(async (req, res) => {
  const id = uuidv4();
  console.log(req.body);
  BudUser.findOneAndUpdate(
    { username: req.body.u_id1 },
    { challenger: req.body.u_id2, challenge_id: id },
    { new: true, useFindAndModify: false },
    function (err1, result1) {
      if (err1) {
        console.log("Error Occured", err1);
      }
      // res.json(result)
      BudUser.findOneAndUpdate(
        { username: req.body.u_id2 },
        { challenger: req.body.u_id1, challenge_id: id },
        { new: true, useFindAndModify: false },
        function (err2, result2) {
          if (err2) {
            console.log("Error Occured", err2);
          }

          const date = new Date();
          const challenge = new BudChallenge({
            challenge_id: id,
            start_date: date,
            user1:result1.u_id,
            user2:result2.u_id,
            user1_pt: 0,
            user2_pt: 0,
            winner: "",
          });
          console.log(challenge);

          challenge.save(function (err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(result);
            }
          });
          res.json({ msg: "success", result1, result2 });
        }
      );
    }
  );
});

// const challengeHandler2 = asyncHandler(async(res,res)=>{
//   const id = uuidv4();
//   const challenge = new BudChallenge({
//     challenge_id:id,
//     start_date:new Date
//   })
// })
// schedule.scheduleJob("30 16 * * *",()=>{
//   console.log("Im Coming")
  const date = new Date();
  var temp;
  const todayDate = date.getFullYear()+"-"+('0'+(date.getMonth()+1).toString().slice(-2))+"-"+date.getDate();
  console.log(todayDate);
  BudChallenge.find({},function(err,results){
    // console.log(results)
    results.map((result)=>{
  
      // console.log(result)
      BudUser.find({challenge_id:result.challenge_id},function(err,results1){
        // console.log(results1)
        // results1.map((result1)=>{
          // console.log(result1)
          var compet_1 = results1[0];
          var compet_2 = results1[1] ;
          console.log(results1[0].u_id)
          console.log(results1[1].u_id)
          if(compet_1.u_id!==result.user1){
            temp=compet_1;
            compet_1=compet_2;
            compet_2=temp;
          }
          
          console.log(compet_1.u_id)
          console.log(compet_2.u_id)
          Budget.find({u_id:[compet_1.u_id,compet_2.u_id],ledgerDate:todayDate},function(err,challengLedger){
         
         
            // if(challengLedger[0]){
              // console.log(challengLedger[0].totalPerday)
              // console.log(Math.round(results1[0].maxLimit/30))
              // if(challengLedger[0].totalPerday < Math.round(results1[0].maxLimit/30)){
              //   console.log("1 point")
              // }
              // console.log(challengLedger[1].totalPerday)
              // // console.log(Math.round(results1[1].maxLimit/30))
              // if(challengLedger[1].totalPerday < Math.round(results1[1].maxLimit/30)){
              //   console.log("1 point")
              // }

              // Algorithm for Clash Point Declaration


              // If user1 is not entered ledger today
          try{
              var limitPerday_1 = Math.round(compet_1.maxLimit/30)
              var limitPerday_2 = Math.round(compet_1.maxLimit/30)

              var percent_1 = Math.round((challengLedger[0].totalPerday / limitPerday_1)*100);
              var percent_2 = Math.round((challengLedger[1].totalPerday / limitPerday_2)*100);

              // if(results1[0])
              console.log(limitPerday_1,limitPerday_2)
              console.log(percent_1 + "p1",percent_2 + "p2")
              

              if(percent_1 < percent_2){
                console.log("Person 1 - 1 point")
                BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
                  $inc:{user1_pt:1}
                },(err,result4)=>{
                  if(err) throw err
                  console.log(result4);
                  console.log("Point added for user 1")
                })
              }
             else if(percent_2 < percent_1){
                console.log("Person 2 - 1 point")
                BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
                  $inc:{user2_pt:1}
                },(err,result4)=>{
                  if(err) throw err
                  console.log(result4);
                  console.log("Point added for user 2")
                })
              }
             else if(percent_1 === percent_2){
                console.log("Person 1 and 2 - 1 point")
                BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
                  $inc:{user1_pt:1,user2_pt:1}
                },(err,result4)=>{
                  if(err) throw err
                  console.log(result4);
                  console.log("Point added for both")
                })
              } 

            } catch(error){
              console.log(error)
              // if(challengLedger[0].totalPerday===undefined){
              //   console.log("1 free point for user1")
              // }
            }
            // }
          })
        // })
      })
    })
  })
// })

const challengers = asyncHandler(async (req, res) => {});

export { authUser, registerUser, challengeHandler };

// oAuth Implementations

// Facebook oAuth
// passport.use(new FacebookStrategy({
//   clientID: process.env.APP_ID,
//   clientSecret: process.env.APP_SECRET,
//   callbackURL: "http://localhost:3001/budgetize/users/auth/facebook/success",
//   profileFields: ['id', 'displayName', 'photos', 'email']
// },

// function(accessToken, refreshToken, profile, cb) {

//   console.log(profile);
//   console.log(accessToken);
// // To download profile image which was returned by facebook as download link
// const download_image = (url, image_path) =>
//   axios({
//     url,
//     responseType: 'stream',
//   }).then(
//     response =>
//       new Promise((resolve, reject) => {
//         console.log(path.join(__dirname,"../images"));
//         response.data
//           .pipe(fs.createWriteStream(path.join(__dirname,"../images/"+profile.id+".jpg")))
//           .on('finish', () => resolve())
//           .on('error', e => reject(e));
//       }),
//   );

//   (async () => {
//     try{
//       let example_image_1 = await download_image(profile.photos[0].value,profile.id+".jpg");

//       console.log(example_image_1.status); // true
//       console.log(example_image_1.error); // ''
//     }catch(error){
//       console.log("Error ra venna",error)
//     }

//   })();

//   BudUser.findOrCreate({ u_id: profile.id ,username:profile.displayName}, function (err, user) {
//     // console.log(user)
//     return cb(err, user);
//   });
// }
// ));

// // Middlewares and functions of Facebook auth EndPoints.
//   const fbAuth =  passport.authenticate('facebook')

//   const fbAuthMW =  passport.authenticate('facebook', { failureRedirect: '/login' })

//   const fbAuthRedirect = (req,res)=>{
//     res.send("Success")
//   }

//   // const magicLogin = new SnapchatStrategy.default();

//   try {
//     passport.use(new SnapchatStrategy.default({
//     clientID: process.env.SNAP_APP_ID,
//     clientSecret: process.env.SNAP_APP_SECRET,
//     callbackURL: "http://localhost:3001/budgetize/users/auth/snapchat/callback",
//     profileFields: ['id', 'displayName', 'bitmoji']
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     console.log("inside callback")
//     console.log(profile);
//     console.log(accessToken);
//     BudUser.findOrCreate({ u_id: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
//   ));
// } catch(error){
//   console.log("Snap Error", error)
// }
//   console.log("outside callback");

// const snapAuth=passport.authenticate('snapchat',{ scope: ['user.display_name', 'user.bitmoji.avatar'] });

// const snapAuthMW=passport.authenticate('snapchat', { failureRedirect: '/login' })
