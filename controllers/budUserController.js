import express from "express";
import jwt from "jsonwebtoken";
import BudUser from "../models/budUsersModel.js";
import BudChallenge from "../models/budChallenge.js";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";
import passport from "passport";
import schedule from "node-schedule";
import nodemailer from "nodemailer";
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
            user1: result1.u_id,
            user2: result2.u_id,
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

const rule = new schedule.RecurrenceRule();
rule.tz = 'IN';
schedule.scheduleJob("26 12 * * *",()=>{
  console.log("Schedule Started");
const date = new Date();
// console.log(date.to)
var temp;
var limitPerday_1,limitPerday_2,user1Percent,user2Percent;
const todayDate =
  date.getFullYear() +
  "-" +
  ("0" + (date.getMonth() + 1).toString().slice(-2)) +
  "-" +
  date.getDate();


BudChallenge.find({}, function (err, challenges) {
  if (err) {
    console.log(err);
  } else {
   
    challenges.map((challenge) => {
      BudUser.find(
        { challenge_id: challenge.challenge_id },
        function (err2, challengedUsers) {
          if (err2) throw err2;
        

          // Algorithm for challenge points declaration system.!!
          if(challenge.user1===challengedUsers[0].u_id){
            console.log("ivandhaan");
          }else if(challenge.user1===challengedUsers[1].u_id){
              console.log("should swap")
            temp=challengedUsers[1];
            challengedUsers[1]=challengedUsers[0];
            challengedUsers[0]=temp;
            
             limitPerday_1 = challengedUsers[0].maxLimit/30;
             limitPerday_2 = challengedUsers[1].maxLimit/30;
     
            Budget.find(
                {
                    u_id: [challengedUsers[0].u_id, challengedUsers[1].u_id],
                    ledgerDate: todayDate,
                  },
                  function (err3, todayLedgers) {
                      if (err3) throw err3;
                 
                      if (
                          todayLedgers.length === 0 &&
                          (todayLedgers[0]===undefined &&
                          todayLedgers[1]===undefined)
                        ) {
                            console.log("Empty.. So No Points");
                          } else if(todayLedgers[1]===undefined && todayLedgers[0]){
                            if(todayLedgers[0].u_id===challenge.user1){
                              if(todayLedgers[0].totalPerday < limitPerday_1){
                                console.log("1 free and 1 winning point user 1 raa")
                                updateUser1Point(challenge.challenge_id,todayLedgers[0].u_id,2)
                              }else if(todayLedgers[0].totalPerday > limitPerday_1){ 
                                console.log("1 free point for user 1 raa")
                                updateUser1Point(challenge.challenge_id,todayLedgers[0].u_id,1)
                              }
                            } else if(todayLedgers[0].u_id===challenge.user2){
                              if(todayLedgers[0].totalPerday < limitPerday_2){
                                console.log("1 free and 1 winning point user 2 raa")
                                updateUser2Point(challenge.challenge_id,challenge.user2,2)
                              }else if(todayLedgers[0].totalPerday > limitPerday_2){
                                console.log("1 free point for user 2 raa")
                                updateUser2Point(challenge.challenge_id,challenge.user2,1)
                              }
                            }

                          }
                          else if(todayLedgers[0] && todayLedgers[1]){
                              if (challenge.user1 !== todayLedgers[0].u_id) {
                                  console.log("should swap");
                          
                                  temp = todayLedgers[1];
                                  todayLedgers[1] = todayLedgers[0];
                                  todayLedgers[0] = temp;
                                }
                                
                                
                                user1Percent = Math.round((todayLedgers[0].totalPerday/limitPerday_1)*100);
                                user2Percent = Math.round((todayLedgers[1].totalPerday/limitPerday_2)*100);
                            

                                if(todayLedgers[0].totalPerday < limitPerday_1){
                                  console.log("USer 1 kammi")
                                  if(user1Percent < user2Percent){
                                    console.log("User 1 won 2 points")
                                    updateUser1Point(challenge.challenge_id,todayLedgers[0].u_id,2)
                                  }else{
                                    console.log("User 1 won 1 points")
                                    updateUser1Point(challenge.challenge_id,todayLedgers[0].u_id,1)
                                  }
                                }
                                if(todayLedgers[1].totalPerday < limitPerday_2){
                                  console.log("USer 2 vum kammi")
                                  if(user2Percent < user1Percent){
                                    console.log("User 2 won 2 points")
                                    updateUser2Point(challenge.challenge_id,todayLedgers[1].u_id,2)
                                  }else{
                                    console.log("User 2 won 1 points")
                                    updateUser2Point(challenge.challenge_id,todayLedgers[1].u_id,1)
                                  }
                                }else if(user1Percent===user2Percent){
                                  console.log("Draw - Each one point")
                                }

                             
                                  }
                                }
                              );
          }

        }
      );
    });
  }
});
});

function updateUser2Point(challenge_uid,user_id,point) {

  BudChallenge.findOneAndUpdate({challenge_uid:challenge_uid,user2:user_id},{
    $inc:{user2_pt:Number(point)}
  },function(err,result){
    if (err) throw err;
    // console.log(result);
    console.log(`${point} point for user 2`)
  })
}
function updateUser1Point(challenge_uid,user_id,point) {

  BudChallenge.findOneAndUpdate({challenge_uid:challenge_uid,user1:user_id},{
    $inc:{user1_pt:Number(point)}
  },function(err,result){
    if (err) throw err;
    // console.log(result);
    console.log(`${point} point for user 1`)
  })
}



const transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  // port: 587,
  service:"gmail",
  auth: {
      user: 'budgetizeyourself@gmail.com',
      pass: 'therihari2004'
  }
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <budgetizeyourself@gmail.com>', // sender address
    to: "chocoboihari01@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log(info)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}
// main().catch(console.error);


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









// Points Declaration Algorithm

// BudChallenge.find({},function(err,results){
//   // console.log(results)
//   results.map((result)=>{

//     // console.log(result)
//     BudUser.find({challenge_id:result.challenge_id},function(err,results1){
//       // console.log(results1)
//       // results1.map((result1)=>{
//         // console.log(result1)
//         var compet_1 = results1[0];
//         var compet_2 = results1[1] ;
//         // console.log(results1[0].u_id)
//         // console.log(results1[1].u_id)
//         if(compet_1.u_id!==result.user1){
//           temp=compet_1;
//           compet_1=compet_2;
//           compet_2=temp;
//         }

//         // console.log(compet_1.u_id)
//         // console.log(compet_2.u_id)
//         Budget.find({u_id:[compet_1.u_id,compet_2.u_id],ledgerDate:todayDate},function(err,challengLedger){

//           // console.log(challengLedger[0])
//           // console.log(challengLedger[1])
//           // if(challengLedger[0]){
//             // console.log(challengLedger[0].totalPerday)
//             // console.log(Math.round(results1[0].maxLimit/30))
//             // if(challengLedger[0].totalPerday < Math.round(results1[0].maxLimit/30)){
//             //   console.log("1 point")
//             // }
//             // console.log(challengLedger[1].totalPerday)
//             // // console.log(Math.round(results1[1].maxLimit/30))
//             // if(challengLedger[1].totalPerday < Math.round(results1[1].maxLimit/30)){
//             //   console.log("1 point")
//             // }

//             // Algorithm for Clash Point Declaration

//             // If user1 is not entered ledger today
//         // try{
//           if(challengLedger[0] && challengLedger[1]){
//             var limitPerday_1 = Math.round(compet_1.maxLimit/30)
//             var limitPerday_2 = Math.round(compet_1.maxLimit/30)

//             var percent_1 = Math.round((challengLedger[0].totalPerday / limitPerday_1)*100);
//             var percent_2 = Math.round((challengLedger[1].totalPerday / limitPerday_2)*100);

//             // if(results1[0])
//             console.log(limitPerday_1,limitPerday_2)
//             console.log(percent_1 + "p1",percent_2 + "p2")

//             if(percent_1 < percent_2){
//               if(limitPerday_1<challengLedger[0].totalPerday){
//                 console.log("Person 1 - 2 point")
//                 BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                   $inc:{user1_pt:2}
//                 },(err,result4)=>{
//                   if(err) throw err
//                   console.log(result4);
//                   console.log("2 Points added for user 1")
//                 })
//               }else{
//               console.log("Person 1 - 1 point")
//               BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                 $inc:{user1_pt:1}
//               },(err,result4)=>{
//                 if(err) throw err
//                 console.log(result4);
//                 console.log("Point added for user 1")
//               })
//             }
//             }
//            else if(percent_2 < percent_1){
//             if(limitPerday_2<challengLedger[1].totalPerday){
//               console.log("Person 2 - 2 point")
//               BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                 $inc:{user2_pt:2}
//               },(err,result4)=>{
//                 if(err) throw err
//                 console.log(result4);
//                 console.log("2 Points added for user 2")
//               })
//             }else{
//               console.log("Person 2 - 1 point")
//               BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                 $inc:{user2_pt:1}
//               },(err,result4)=>{
//                 if(err) throw err
//                 console.log(result4);
//                 console.log("Point added for user 2")
//               })
//             }
//             }
//            else if(percent_1 === percent_2){
//               console.log("Person 1 and 2 - 1 point")
//               BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                 $inc:{user1_pt:1,user2_pt:1}
//               },(err,result4)=>{
//                 if(err) throw err
//                 console.log(result4);
//                 console.log("Point added for both")
//               })
//             }
//           }
//           // } catch(error){
//             // console.log(error)
//             // console.log(challengLedger[0])
//             else if(challengLedger[0]===undefined && challengLedger[1] === undefined){
//               console.log("NO POINTS")
//             }
//             // else if(challengLedger[0]===undefined && challengLedger[1]){
//             //   if(challengLedger[1].u_id===compet_1.u_id){
//             //     console.log("1 Point for user 2")
//             //   }else if(challengLedger[1].u_id===compet_2.u_id){
//             //     console.log("1 Point for user 1")
//             //   }
//             // }
//             else if(challengLedger[1]===undefined && challengLedger[0]){
//               if(challengLedger[0].u_id===compet_1.u_id){
//                 // console.log("1 Point for user 1")
//                 if(limitPerday_1<challengLedger[0].totalPerday){
//                   console.log("Person 1 - 2 point")
//                   BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                     $inc:{user1_pt:2}
//                   },(err,result4)=>{
//                     if(err) throw err
//                     console.log(result4);
//                     console.log("2 Points added for user 1")
//                   })
//                 }else{
//                 BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                   $inc:{user1_pt:1}
//                 },(err,result4)=>{
//                   if(err) throw err
//                   console.log(result4);
//                   console.log("Point added for user 1")
//                 })
//               }
//               }else if(challengLedger[0].u_id===compet_2.u_id){
//                 if(limitPerday_1<challengLedger[0].totalPerday){
//                   console.log("Person 2 - 2 point")
//                   BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                     $inc:{user2_pt:2}
//                   },(err,result4)=>{
//                     if(err) throw err
//                     console.log(result4);
//                     console.log("2 Points added for user 2")
//                   })
//                 } else{
//                 console.log("1 Point for user 2")
//                 BudChallenge.findOneAndUpdate({challenge_id:result.challenge_id},{
//                   $inc:{user2_pt:1}
//                 },(err,result4)=>{
//                   if(err) throw err
//                   console.log(result4);
//                   console.log("Point added for user 2")
//                 })
//               }
//               }
//             }
//             // console.log(challengLedger[0].u_id)
//             // console.log(compet_1.u_id)
//             // if(challengLedger[0].totalPerday===undefined){
//             //   console.log("1 free point for user1")
//             // }
//           // }
//           // }
//         })
//       // })
//     })
//   })
// })
// // })
