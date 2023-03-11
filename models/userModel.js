import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportlocalmongoose from "passport-local-mongoose";
import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config()
const userschema = new mongoose.Schema({
  u_id: String,
  email: String,
  username: String,
  password: String,
});
userschema.plugin(passportlocalmongoose);

const User = new mongoose.model("User", userschema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
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

export default User;
