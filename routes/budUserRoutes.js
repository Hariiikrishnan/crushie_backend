import express from 'express';
import multer from "multer";
const app = express();
import {upload} from "../utils/uploadImage.js"
import {
    authUser,
    registerUser,
    fbAuth,
    fbAuthMW,
    fbAuthRedirect,
    snapAuth,
    snapAuthMW,
    challengeHandler
} from '../controllers/budUserController.js'



app.get('/auth/facebook',fbAuth);
app.get('/auth/facebook/success',fbAuthMW,fbAuthRedirect);

app.get('/auth/snapchat/',snapAuth)
app.get('/auth/snapchat/callback',snapAuthMW,(req,res)=>{
    res.send("Snapchat Success")
})


app.post("/challenge",challengeHandler);
app.post("/login",authUser);
app.post("/register",upload.single("profilePhoto"),registerUser);

export default app;