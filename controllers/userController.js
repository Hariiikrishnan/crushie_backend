import express from 'express';
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";
import passport from "passport";


const app = express();

const authUser = asyncHandler(async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = new User({
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
          User.findOne({ username: username }, function (err, result) {
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

const registerUser = asyncHandler(async (req, res) => {
  User.register(
    { u_id: uuidv4(), username: req.body.username, email: req.body.email },
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

export { authUser, registerUser };
