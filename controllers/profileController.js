import express from "express";
import Budget from "../models/budgetizeModel.js";
import jwt from "jsonwebtoken";

import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';

const app =express();
app.use(bodyparser.urlencoded({extended:true}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fetchPfp = asyncHandler(async(req,res)=>{
    res.sendFile(req.params.pfp_uid+".jpg",{root:path.join(__dirname,"../images")})
})




export {fetchPfp};