import express from 'express';
import multer from "multer";
const app = express();
import {upload} from "../utils/uploadImage.js"
import {
    authUser,
    registerUser,
    fetchChallenges,
    challengeHandler,
    checkJwtExpiration
} from '../controllers/budUserController.js';
import {verifyToken,verifyRefreshToken} from "../utils/verifyToken.js";
import {generateNewToken} from "../utils/generateToken.js";



// app.get('/auth/facebook',fbAuth);
// app.get('/auth/facebook/success',fbAuthMW,fbAuthRedirect);

// app.get('/auth/snapchat/',snapAuth)
// app.get('/auth/snapchat/callback',snapAuthMW,(req,res)=>{
//     res.send("Snapchat Success")
// })



app.post("/challenge",challengeHandler);
app.get("/challenges/:challenge_id",fetchChallenges);

app.post("/login",authUser);
app.post("/checkJwt",checkJwtExpiration);
app.post("/refreshToken",verifyToken,generateNewToken);
app.post("/register",upload.single("profilePhoto"),registerUser);

export default app;