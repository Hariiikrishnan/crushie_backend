import express from "express";
import Moment from "../models/momentModel.js";
import jwt from "jsonwebtoken";

import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";

const getMoments = asyncHandler(async (req, res) => {
  const uid = req.params.uid;
  console.log(uid);
  jwt.verify(req.token, process.env.SECRETKEY, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      Moment.find({ u_id: uid }, function (err, results) {
        if (err) {
          console.log("Error Occured " + err);
          window.alert(err);
        } else if (results) {
          console.log(results);
          res.json({ results });
        }
      });
    }
  });
});

const createMoment = asyncHandler(async (req, res) => {
  const uid = req.params.uid;
  //  const createdTime = req.body.createdTime;
  const date = req.body.date;
  const time = req.body.time;
  const place = req.body.place;
  const color = req.body.color;
  const saw = req.body.saw;
  const response = req.body.response;

  const moment = new Moment({
    // createdTime:createdTime,
    u_id: uid,
    date: date,
    time: time,
    place: place,
    color: color,
    saw: saw,
    response: response,
  });

  moment.save(function (err, result) {
    if (err) {
      console.log(err);
      // res.sendStatus(500);
      // return;
    } else {
      res.json(result);
    }
  });
});

const updateMoment = asyncHandler(async (req, res) => {
  const id = req.params.postid;
  Moment.findOneAndUpdate(
    { _id: ObjectId(id) },
    req.body,
    { new: true, useFindAndModify: false },
    function (err, result) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.json(result);
    }
  );
});

const deleteMoment = asyncHandler(async (req, res) => {
  Moment.deleteOne({ _id: req.params.postid }, function (err, message) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.json({ message: "Moment Deleted Successfully!" });
  });
});

export { getMoments, createMoment , updateMoment , deleteMoment };