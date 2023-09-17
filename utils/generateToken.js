import jwt from "jsonwebtoken";
import BudUser from "../models/budUsersModel.js";

const generateNewToken = (req,res)=>{
    const user = {
        username:req.userDetails.user.username,
        password:req.userDetails.user.password
    };

    // console.log(req.userDetails.user);
    // console.log(user);
    var accessToken = jwt.sign({ user }, process.env.SECRETKEY, {expiresIn:"14m"});
    var refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRETKEY, {expiresIn:"10d"});
    
    BudUser.findOne({ username: user.username }, function (err, result) {
      if (err) {
        console.log(err);
        
      } else {
          res.json({ token: accessToken,refreshToken:refreshToken, user: result });
      }
    });
}

export {generateNewToken};