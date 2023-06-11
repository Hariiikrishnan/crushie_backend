import express from "express";
import verifyToken from "../utils/verifyToken.js";
const app = express();

import {
  createBudget , getAllLedger , getSearchedLedger, deleteLedger
} from "../controllers/budgetController.js";

// app.get("/post/:uid", verifyToken, getMoments);
app.get("/:pgNo",getAllLedger);
app.get("/search/:searchDate",getSearchedLedger);
app.post("",createBudget);
app.delete("/:id",deleteLedger);
// app.post("/edit/:postid",verifyToken,updateMoment);
// app.delete("/delete/:postid",verifyToken,deleteMoment);

export default app;
