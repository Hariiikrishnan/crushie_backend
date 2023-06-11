import express from 'express';
import session from "express-session";
import dotenv from "dotenv";
import bodyparser from "body-parser";
import passport from "passport";
import cors from "cors";

import connectDB from './config/db.js'

import userRoutes from './routes/userRoutes.js'
import momentRoutes from './routes/momentRoutes.js'


import memoryRoutes from './routes/memoryRoutes.js'

import budgetRoutes from './routes/budgetRoutes.js'
import budUserRoutes from './routes/budUserRoutes.js'

dotenv.config()
connectDB()
const app = express()
const PORT = process.env.PORT || 3001;
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));

// app.use(cors({credentials:true,origin:"https://crushie-moments.netlify.app/" || "http://localhost:3000"}));
app.use(cors()); 
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
app.use('/budgetize/users', budUserRoutes)


app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
  });
  