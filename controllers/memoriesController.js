import express from "express";
import Memory from "../models/memoriesModel.js";

import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";
import url from "url";

const app =express();

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.json());
const getAllMemories = asyncHandler(async(req,res)=>{

    Memory.find( {}, function (err, results) {
        if (err) {
          console.log("Error Occured " + err);
          window.alert(err);
        } else if (results) {
          res.json({ results });
        }
      });
})

const createMemory = asyncHandler(async(req,res)=>{

    const pid =req.body.pid
    const content =req.body.content
    var name = req.body.name
   
        
   
   const memory = new Memory({
    p_id:pid,
    content:content,
    name:name
   });

   memory.save(function (err, result) {
    if (err) {
      console.log(err);
      // res.sendStatus(500);
      // return;
    } else {
      res.json(result);
    }
  })
})

export { getAllMemories, createMemory  };