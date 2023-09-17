import express from "express";
import {verifyToken} from "../utils/verifyToken.js";
const app = express();

import {
  getMoments,
  createMoment,
  updateMoment,
  deleteMoment,
} from "../controllers/momentController.js";

app.get("/post/:uid", verifyToken, getMoments);
app.post("/:uid",verifyToken,createMoment);
app.post("/edit/:postid",verifyToken,updateMoment);
app.delete("/delete/:postid",verifyToken,deleteMoment);

export default app;
