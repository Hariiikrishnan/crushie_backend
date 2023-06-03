import express from "express";
import Budget from "../models/budgetizeModel.js";
import jwt from "jsonwebtoken";

import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";

const app =express();
app.use(bodyparser.urlencoded({extended:true}));




const getAllLedger = asyncHandler(async(req,res)=>{

  const skip = req.params.pgNo ? Number(req.params.pgNo) : 0;

  try {
    const results = await Budget.find({})
    .sort({x:1,_id:1 })
    .skip(skip > 0 ? ( ( skip - 1 ) * 6) : 0)
    .limit(6)
   

    
    res.json({ success: true, results: results});
  } catch (error) {
    console.log("Error:", error.message);
  }
})

const getSearchedLedger = asyncHandler( async (req,res)=>{
  const searchedDate = req.params.searchDate;
  console.log(searchedDate);
  console.log(req.params);

  Budget.find({ledgerDate:searchedDate},(err,results)=>{
    if(err){
      console.log("Error Occured" + err);
      window.alert(err)
    }else{
      console.log(results);
      res.json({results})
    }
  })
})

const createBudget = asyncHandler(async (req, res) => {

    const expenses = req.body.expenses;
    const totalPerday = req.body.totalPerDay;
    const ledgerDate = req.body.ledgerDate;
  
    const budget = new Budget({
      // createdTime:createdTime,
      expenses:expenses,
      totalPerday:totalPerday,
      ledgerDate:ledgerDate
    });

    budget.save(function (err, result) {
      if (err) {
        console.log(err);
        // res.sendStatus(500);
        // return;
      } else {
        console.log(result)
        res.json(result);
      }
    });
  });

  const deleteLedger = asyncHandler (async(req,res)=>{
    const id = req.params.id;

    Budget.deleteOne({_id : id},function(err){
      if(err){
        console.log(err)
        res.sendStatus(500)
        return;
      }
    })

    Budget.find({},(err,results)=>{
      if(err){
        console.log("Error Occured" + err);
        window.alert(err)
      }else{
        // console.log(results);
        res.json({results})
      }
    })
  })


  export {  createBudget ,getAllLedger,getSearchedLedger, deleteLedger };