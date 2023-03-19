import express from "express";
// import verifyToken from "../utils/verifyToken.js";
const app = express();

import {
    getAllMemories,
    createMemory
} from "../controllers/memoriesController.js";

app.get("/post", getAllMemories);
app.post("/post",createMemory);


export default app;
