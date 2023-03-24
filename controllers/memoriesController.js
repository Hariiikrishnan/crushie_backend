import express from "express";
import Memory from "../models/memoriesModel.js";

import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";
import url from "url";

const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());
const getAllMemories = asyncHandler(async (req, res) => {
 
  const skip = req.params.pgNo ? Number(req.params.pgNo) : 0;

  try {
    const results = await Memory.find({})
    .sort({x:1,_id:1 })
    .skip(skip > 0 ? ( ( skip - 1 ) * 5) : 0)
    .limit(5)
   

    
    res.json({ success: true, results: results});
  } catch (error) {
    console.log("Error:", error.message);
  }
});

const createMemory = asyncHandler(async (req, res) => {
  console.log("called");
  const pid = req.body.pid;
  const content = req.body.content;
  var name = req.body.name;

  const memory = new Memory({
    p_id: pid,
    x:"x",
    content: content,
    name: name,
  });

  memory.save(function (err, result) {
    if (err) {
      console.log(err);
      // res.sendStatus(500);
      // return;
    } else {
      res.json(result);
    }
  });
});

export { getAllMemories, createMemory };
