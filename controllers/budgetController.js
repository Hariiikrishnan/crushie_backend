import express from "express";
import Budget from "../models/budgetizeModel.js";
import BudUser from "../models/budUsersModel.js";

import jwt from "jsonwebtoken";

import asyncHandler from "express-async-handler";
import bodyparser from "body-parser";

const app =express();
app.use(bodyparser.urlencoded({extended:true}));




const getAllLedger = asyncHandler(async(req,res)=>{


  const skip = req.params.pgNo ? Number(req.params.pgNo) : 0;

  try {
    const results = await Budget.find({u_id:req.params.u_id})
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
  // console.log(searchedDate);

  Budget.find({ledgerDate:searchedDate,u_id:req.params.u_id},(err,results)=>{
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
      u_id:req.params.u_id,
      expenses:expenses,
      totalPerday:totalPerday,
      ledgerDate:ledgerDate
    });

    budget.save(function (err, result) {
      if (err || err?.err.code===11000) {
        // const updatedExpense = req.body.expenses.flat(1);
        // // console.log(err.keyValue.ledgerDate)
        // console.log(...req.body.expenses)
        // console.log(updatedExpense)
        console.log(req.params.u_id+" in update")
        Budget.findOneAndUpdate(
          { ledgerDate: err.keyValue.ledgerDate},
          {$push:{expenses: req.body.expenses},
           $inc:{totalPerday:req.body.totalPerDay}},
          // {expenses:req.body.expenses,
          //   totalPerday:totalPerday+req.body.totalPerDay},
          { new: true, useFindAndModify: false },
          function (err, result) {
            if (err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }
            BudUser.findOneAndUpdate({u_id:req.params.u_id},
              { $inc: { currentAmount:req.body.totalPerDay} },
             { new: true, useFindAndModify: false },function(err,result){
               if(err){
                 console.log(err)
               }
               else{
                 console.log("incremented")
               }
             })
            console.log(result)
            res.json(result);
          }
        );

      } else {

          BudUser.findOneAndUpdate({u_id:req.params.u_id},
             { $inc: { currentAmount:req.body.totalPerDay} },
            { new: true, useFindAndModify: false },function(err,result){
              if(err){
                console.log(err)
              }
              else{
                console.log("incremented")
              }
            })
         
        console.log(result)
        res.json(result);
      }
    });
  });

  const deleteLedger = asyncHandler (async(req,res)=>{
    const id = req.params.id;

    Budget.deleteOne({_id : id,u_id:req.params.u_id},function(err){
      if(err){
        console.log(err)
        res.sendStatus(500)
        return;
      }
    })

    Budget.find({u_id:req.params.u_id,},(err,results)=>{
      if(err){
        console.log("Error Occured" + err);
        window.alert(err)
      }else{
        // console.log(results);
        res.json({results})
      }
    })
  })

   const recentFetch = asyncHandler(async(req,res)=>{
 
    try{
      const results = await Budget.find({u_id:req.params.u_id}).limit(3)

      res.json({results})
    }catch (error) {
      console.log("Error Message :" , error )
    }
   })

   
  export {  createBudget ,getAllLedger,getSearchedLedger, deleteLedger , recentFetch};