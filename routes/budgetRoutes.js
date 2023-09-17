import express from "express";
import {verifyToken} from "../utils/verifyToken.js";
const app = express();

import {
  createBudget , getAllLedger , getSearchedLedger, deleteLedger , recentFetch
} from "../controllers/budgetController.js";


app.get("/allLedger/:pgNo/:u_id",verifyToken,getAllLedger);
app.get("/search/:searchDate/:u_id",verifyToken,getSearchedLedger);
app.get("/recent/:u_id",verifyToken,recentFetch);
app.post("/add/:u_id",verifyToken,createBudget);
app.delete("/delete/:id/:u_id/:totAm/:selectedDate",verifyToken,deleteLedger);


export default app;
