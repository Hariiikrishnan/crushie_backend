import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportlocalmongoose from "passport-local-mongoose";
import express from "express";
import dotenv from "dotenv";
import findOrCreate from 'mongoose-findorcreate';


const app = express();
dotenv.config()
const userschema = new mongoose.Schema({
  u_id: String,
  email: String,
  username: String,
  password: String,
  maxLimit:Number,
  currentAmount:Number,
  challenge:String
});
userschema.plugin(passportlocalmongoose);
userschema.plugin(findOrCreate);

const BudUser = new mongoose.model("BudUser", userschema);

passport.use(BudUser.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    BudUser.findById(id, function (err, user) {
    done(err, user);
  });
});
app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.session());

export default BudUser;
