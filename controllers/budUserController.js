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
import multer from "multer";
// import passportlocalmongoose from "passport-local-mongoose";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

import fs from "fs";
import axios from "axios";
// import GoogleStrategy from 'passport-google-oauth20'.Strategy;
// import FacebookStrategy from "passport-facebook"
// import SnapchatStrategy from "passport-snapchat";

import { upload, p_uid } from "../utils/uploadImage.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import Budget from "../models/budgetizeModel.js";
import { error } from "console";
import { match } from "assert";

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
                res.json({ token: token, user: result });
             
            }
          });
        });
      });
    }
  });
});

function buildSuccessMsg(urlList){

  console.log(urlList);
  // // Building success msg
  // var response = '<h1><a href="/">Click to go to Home page</a><br></h1><hr>'
  
  // for(var i=0;i<urlList.length;i++){
  //   response += "File uploaded successfully.<br><br>"
  //   response += `FILE URL: <a href="${urlList[i]}">${urlList[i]}</a>.<br><br>`
  //   response += `<img src="${urlList[i]}" /><br><hr>`
  // }
  // response += `<br><p>Now you can store this url in database or do anything with it  based on use case.</p>`
  return response  
}



const registerUser = asyncHandler(async (req, res) => {

   var locaFilePath = req.file.path
  var result = await uploadToCloudinary(locaFilePath)
  // var response = buildSuccessMsg([result.url])
  // return res.send(response)

  console.log("doing here");
  console.log(result.url);
  // console.log(req.body);
  BudUser.register(
    {
      u_id: p_uid,
      username: req.body.username,
      email: req.body.email,
      maxLimit: req.body.maxLimit,
      profileUrl:result.url,
      currentAmount: 0,
      challenge_id:[]
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


const fetchChallenges = asyncHandler(async (req,res)=>{
  
  var challenges = req.params.challenge_id.split(",",4);
  var active = [];
  var completed = [];
  
  // console.log(challenges);
  BudChallenge.find({challenge_id:challenges},(err,results)=>{
    if (err) throw err

    // console.log(results);
    results.map((challenge)=>{
      if(challenge.winner === ""){
        active.push(challenge);
      }else{
        
        completed.push(challenge);
      }
    });

    console.log(active);
    console.log(completed);
    res.json({active:active,completed:completed})
  })
})


const challengeHandler = asyncHandler(async (req, res) => {
  const id = uuidv4();
  console.log(req.body);
  BudUser.findOneAndUpdate(
    { username: req.body.u_id1 },
    {  $push:{ challenge_id: id } },
    { new: true, useFindAndModify: false },
    function (err1, result1) {
      if (err1) {
        console.log("Error Occured", err1);
      }
      // res.json(result)
      BudUser.findOneAndUpdate(
        { username: req.body.u_id2 },
        { $push:{ challenge_id: id }},
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
            user1Name: req.body.u_id1,
            user2Name: req.body.u_id2,
            user1Pfp:result1.profileUrl,
            user2Pfp:result2.profileUrl,
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


// Used 18 because digital ocean server is 6 hours ahead of indian time.
// 28 18 * * *

schedule.scheduleJob("28 18 * * *",()=>{
  console.log("Schedule Started");
const date = new Date();
// console.log(date.to)
var temp;
var limitPerday_1,limitPerday_2,user1Percent,user2Percent;
const todayDate =
  date.getFullYear() +
  "-" +
  ("0" + (date.getMonth() + 1).toString().slice(-2)) +
  "-" + (date.getDate() < 10  ? ( "0" +  date.getDate() ) : date.getDate() );

  console.log(todayDate);

BudChallenge.find({winner:""}, function (err, challenges) {
  if (err) {
    console.log(err);
  } else {
    challenges.map((challenge) => {
      BudUser.find(
        { challenge_id: challenge.challenge_id },
        function (err2, challengedUsers) {
          if (err2) throw err2;
        

          try{

            // Algorithm for challenge points declaration system.!!
          if(challenge.user1===challengedUsers[0].u_id){
            console.log("ivandhaan");
          }else if(challenge.user1===challengedUsers[1].u_id){
              // console.log("should swap")
              console.log(challenge);
              // console.log(challengedUsers[1]);
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
catch(err){
  console.log(err);
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
  host: 'mail.test.com',
    port: 465,
    secure: true,
  service:"gmail",
  transportMethod: 'SMTP',
  auth: {
      user: 'budgetizeyourself@gmail.com',
      pass: process.env.GMAIL_PASSWORD
  }
});

// async..await is not allowed in global scope, must use a wrapper
async function main(to_Users) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Budgetize" <budgetizeyourself@gmail.com>', // sender address
    to: to_Users, // list of receivers
    subject: "Friendly Challenge Result", // Subject line
    text: `You've won the Friendly Challenge with your friend .`, // plain text body
    html: `<div style="width: 100%;
    height: 100%;
    border: solid rebeccapurple;">
        <div style="height: 300px;
    display: grid;
    justify-content: space-evenly;
    align-items: center;
    background-color: #00ffcc;
    border-radius: 6px;
    margin: 30px;
    padding: 10px 30px;">
            <h2 style="font-family: system-ui;text-align: center;"> Budgetize Friendly Challenge Result !  &#128512;</h2>
            <h3 style="font-family: system-ui;text-align: center;">&#129395; You've won the friendly challenge with your friend!</h3>
            <h3 style="font-family: system-ui;text-align: center;">&#127881; Congratulations on your winning! I hope we made you to reduce your expenses in this challenge with your friends. Let's get start the next challenge!</h3>

            <button style="background-color: black;
            padding: 10px 40px;
            border: solid cornsilk;
            border-radius: 9px;
            text-align: center;">
        
                        <a style="color: white;
            text-decoration: none;
            font-size: 1.1rem;
            font-family: system-ui;"
             href="https://budgetize.netlify.app/login">Start Challenge &#128074;</a>
            </button>
        </div>
    </div>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log(info)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  
  //
}
async function loser_mailing(to_Users) {
console.log("what happen");
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Budgetize" <budgetizeyourself@gmail.com>', // sender address
    to: to_Users, // list of receivers
    subject: "Friendly Challenge Result", // Subject line
    text: `You've lost the Friendly Challenge with your friend .`, // plain text body
    html: `<div style="width: 100%;
    height: 100%;
    border: solid rebeccapurple;">
        <div style="height: 300px;
    display: grid;
    justify-content: space-evenly;
    align-items: center;
    background-color: #00ffcc;
    border-radius: 6px;
    margin: 30px;
    padding: 10px 30px;">
            <h2 style="font-family: system-ui;text-align: center;"> Budgetize Friendly Challenge Result !  &#128512;</h2>
            <h3 style="font-family: system-ui;text-align: center;">&#9785; You've lost the friendly challenge with your friend!</h3>
            <h3 style="font-family: system-ui;text-align: center;">&#128531; We apologize that you lost the friendly challenge with your friend. We hope for better results next time. Let's get start the next challenge!</h3>

            <button style="background-color: black;
            padding: 10px 40px;
            border: solid cornsilk;
            border-radius: 9px;
            text-align: center;">
        
                        <a style="color: white;
            text-decoration: none;
            font-size: 1.1rem;
            font-family: system-ui;"
             href="https://budgetize.netlify.app/login">Start Challenge &#128074;</a>
            </button>
        </div>
    </div>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log(info)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  
  //
}
// main().catch(console.error);



// Schedule for Monthly winner announcement mail API.

// 58 23 31 * * - 


// Scheduler to check the winner of all the challenges and send mail on 30th of every month at 23:58 PM
schedule.scheduleJob("28 18 30 * *",()=>{

  console.log("Schedule started for challenge winner announcement");
  var match_winner ;
  var winners_mailID = [] ;
  var match_loser ;
  var losers_mailID = [] ;
  BudChallenge.find({winner:''},(err,challenges)=>{
    if(err) throw err
  
    // console.log(challenges);
  
    // console.log(challenges);
    challenges.map((challenge)=>{
  
        if (challenge.user2_pt < challenge.user1_pt){
          // console.log("User 1 winner");
          match_winner = challenge.user1;
          match_loser = challenge.user2;
          // console.log(match_winner)
          // console.log(match_loser)
        }else if(challenge.user1_pt < challenge.user2_pt){
          // console.log("User 2 winner");
          match_winner = challenge.user2;
          match_loser = challenge.user1;
          // console.log(match_winner)
          // console.log(match_loser)
        }else if(challenge.user1_pt === challenge.user2_pt){
          console.log("Match drawn");
        }

        BudChallenge.findOneAndUpdate({challenge_id:challenge.challenge_id},{winner:match_winner},(err,result)=>{
          if (err) throw err
          // console.log(result);
        });

        // console.log(match_winner);
        // console.log(match_loser);

      BudUser.find({u_id:[match_winner,match_loser]},(err,challenged_users)=>{
        if (err) throw err
  
        if(challenged_users[0].u_id===match_winner && challenged_users[1].u_id===match_loser){
          // console.log("returned winner  "+challenged_users[0].email);
          winners_mailID.push(challenged_users[0].email);
          
          // console.log("returned loser  " +challenged_users[1].email);
          losers_mailID.push(challenged_users[1].email);
          
          
        }else{
          // console.log(challenged_users[0].email);
            // console.log(challenged_users[1].email);
            winners_mailID.push(challenged_users[1].email);
            losers_mailID.push(challenged_users[0].email);
          }
       
      })
    })

  //  setTimeout(()=>{
  //   console.log(winners_mailID);
  //   console.log(losers_mailID);
  //  },2000)
    
  //  setTimeout(()=>{
    main(winners_mailID).catch(console.error);
    loser_mailing(losers_mailID).catch(console.error);
  //  },30000)
  })
  
});


const challengers = asyncHandler(async (req, res) => {});

export { authUser, registerUser,fetchChallenges, challengeHandler };

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
