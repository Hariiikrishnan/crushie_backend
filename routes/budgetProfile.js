import express from 'express';

const app = express();
import {
    fetchPfp
  } from "../controllers/profileController.js";

app.get("/profile/:pfp_uid",fetchPfp)

export default app;