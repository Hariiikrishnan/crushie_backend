import express from 'express';
import session from "express-session";
import dotenv from "dotenv";
import bodyparser from "body-parser";
import passport from "passport";
import cors from "cors";
// import schedule from "node-schedule";
import path, { dirname } from "path";
import multer from "multer";

import connectDB from './config/db.js'
import connectCloudinary from './config/cloudinary.js'

// import chlngPoints from './utils/chlngPoints.js'

import userRoutes from './routes/userRoutes.js'
import momentRoutes from './routes/momentRoutes.js'


import memoryRoutes from './routes/memoryRoutes.js'

import budgetRoutes from './routes/budgetRoutes.js'
import budUserRoutes from './routes/budUserRoutes.js'
import budgetProfile from './routes/budgetProfile.js'

dotenv.config()
connectDB();
connectCloudinary();
const app = express()
const PORT = process.env.PORT || 3001;
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));

app.use(cors({credentials:true,origin:"https://budgetize.netlify.app/" || "http://localhost:3000"}));


// app.use(cors()); 
// app.use(function(req,res,next){
//   res.setHeader('Access-Control-Allow-Origin','*');
//   next();
// })

app.use(express.json());
app.use(session({
    secret:process.env.SECRETKEY ,
    resave:false,
    saveUninitialized:false
  }));
app.use(passport.session());


// Crushie EndPoints
app.use('/crushie/users', userRoutes)
app.use('/crushie/moments', momentRoutes)

// NB Memories Wall EndPoints
app.use('/nbMemories', memoryRoutes)

// Budgetize Endpoints
app.use('/budgetize', budgetRoutes)
app.use('/budgetize/account', budgetProfile)
app.use('/budgetize/users', budUserRoutes)



// 58 23 * * *

    





app.listen(PORT, function(req,res) {
    console.log("Server is running on Port: " + PORT);
  });
  