import express from 'express'
const app = express();

import {
    authUser,
    registerUser
} from '../controllers/userController.js'


app.post("/login",authUser);
app.post("/register",registerUser);

export default app;