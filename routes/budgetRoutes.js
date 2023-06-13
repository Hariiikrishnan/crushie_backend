import express from "express";
import verifyToken from "../utils/verifyToken.js";
const app = express();

import {
  createBudget , getAllLedger , getSearchedLedger, deleteLedger , recentFetch
} from "../controllers/budgetController.js";

// app.get("/post/:uid", verifyToken, getMoments);
app.get("/allLedger/:pgNo",verifyToken,getAllLedger);
app.get("/search/:searchDate",verifyToken,getSearchedLedger);
app.get("/recent/",verifyToken,recentFetch);
app.post("",verifyToken,createBudget);
app.delete("/:id",verifyToken,deleteLedger);
// app.post("/edit/:postid",verifyToken,updateMoment);
// app.delete("/delete/:postid",verifyToken,deleteMoment);

export default app;
