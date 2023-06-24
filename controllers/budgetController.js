import express from "express";
import Budget from "../models/budgetizeModel.js";
import BudUser from "../models/budUsersModel.js";
import BudChallenge from "../models/budChallenge.js";

import jwt from "jsonwebtoken";

import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";

const app = express();
app.use(bodyparser.urlencoded({ extended: true }));

const getAllLedger = asyncHandler(async (req, res) => {
  const skip = req.params.pgNo ? Number(req.params.pgNo) : 0;

  try {
    const results = await Budget.find({ u_id: req.params.u_id })
      .sort({ x: 1, _id: 1 })
      .skip(skip > 0 ? (skip - 1) * 6 : 0)
      .limit(6);

    res.json({ success: true, results: results });
  } catch (error) {
    console.log("Error:", error.message);
  }
});

const getSearchedLedger = asyncHandler(async (req, res) => {
  const searchedDate = req.params.searchDate;
  // console.log(searchedDate);

  Budget.find(
    { ledgerDate: searchedDate, u_id: req.params.u_id },
    (err, results) => {
      if (err) {
        console.log("Error Occured" + err);
        window.alert(err);
      } else {
        console.log(results);
        res.json({ results });
      }
    }
  );
});

const createBudget = asyncHandler(async (req, res) => {
  var todayDate = new Date();
  // todayDate = todayDate.slice(0,3);
  console.log(req.params.u_id);

  const expenses = req.body.expenses;
  const totalPerday = req.body.totalPerDay;
  const ledgerDate = req.body.ledgerDate;


  var point = 0; 
  if(ledgerDate.slice(5,7)===todayDate.getMonth()+1){
    point = 1;
  }
  const budget = new Budget({
    // createdTime:createdTime,
    u_id: req.params.u_id,
    expenses: expenses,
    totalPerday: totalPerday,
    ledgerDate: ledgerDate,
  });

  budget.save(function (err, result) {
    if (err || err?.err.code === 11000) {

      console.log(err)
      
      // Budget Ledger updation code!
      // console.log(req.params.u_id + " in update");
      // Budget.findOneAndUpdate(
      //   { ledgerDate: err.keyValue.ledgerDate ,u_id: req.params.u_id},
      //   {
      //     $push: { expenses: req.body.expenses },
      //     $inc: { totalPerday: req.body.totalPerDay },
      //   },
      //   // {expenses:req.body.expenses,
      //   //   totalPerday:totalPerday+req.body.totalPerDay},
      //   { new: true, useFindAndModify: false },
      //   function (err, result) {
      //     if (err) {
      //       console.log(err);
      //       res.sendStatus(500);
      //       return;
      //     }
          
          // res.json(result);
        // }
      // );
      
    }else {

      BudUser.findOneAndUpdate(
        { u_id: req.params.u_id },
        { $inc: { currentAmount: req.body.totalPerDay } },
        { new: true, useFindAndModify: false },
        function (err, result) {
          if (err) {
            console.log(err);
          } else {          
            // console.log(result);
            // console.log("incremented");
          }
        }
      );

      // console.log(result);
      res.json(result);
    }
  });
});

const deleteLedger = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const totAm = req.params.totAm;

  // console.log(totAm);

    BudUser.findOneAndUpdate({u_id:req.params.u_id},
      { $inc: { currentAmount:-totAm} },
     { new: true, useFindAndModify: false },function(err2,result2){
       if(err2){
         console.log(err2)
       }
       else{
        // console.log(result2);
         console.log("decremented")
       }
     })
    Budget.deleteOne({ _id: id, u_id: req.params.u_id }, function (err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
  
         Budget.find({ u_id: req.params.u_id },(err2,results)=>{
          if(err2){
            console.log(err2)
          }
          else{
            res.json({results})
          }
         })
    //       // res.json({results})
    
    });
  
});

const recentFetch = asyncHandler(async (req, res) => {
  try {
    const results = await Budget.find({ u_id: req.params.u_id }).limit(3);

    res.json({ results });
  } catch (error) {
    console.log("Error Message :", error);
  }
});

export {
  createBudget,
  getAllLedger,
  getSearchedLedger,
  deleteLedger,
  recentFetch,
};
