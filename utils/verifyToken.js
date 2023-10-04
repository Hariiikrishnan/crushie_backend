import jwt from "jsonwebtoken";


// Verify Access Token
  function verifyToken(req,res,next){

    console.log(req.headers.authorization);
    var bearerHeader;
    // if(req.body.headers){
    //   bearerHeader = req.body.headers.Authorization;
      
    // } else{
    //   bearerHeader = req.headers['authorization'];
      
    // }
    
    bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader!=="undefined"){
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      
      jwt.verify(bearerToken,process.env.SECRETKEY,(err,tokenDetails)=>{
        if(err){
          console.log(err);
          res.sendStatus(403);
        }else{
          // console.log("Valid");
          req.userDetails = tokenDetails;
          req.token = bearerToken;
          // res.json({tokenDetails,message:"Valid Token"})
          next();
        }
      })
    }else{
      console.log("Undefined ena varudhu");
      // console.log(req)
      // console.log(bearerHeader);
      // console.log(req.body.headers.Authorization);
      res.sendStatus(403);
    }
  }


  // Verify Refresh Token
  function verifyRefreshToken(req,res,next){
    // console.log(req.body);
    const refreshToken = req.body.refreshToken;
    if(refreshToken!==undefined){
      jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRETKEY,(err,tokenDetails)=>{
        if(err){
          console.log(err);
          res.sendStatus(403);
        }else{
          console.log("Valid in refReshToken");
          req.userDetails = tokenDetails;
          // console.log(req);
          // console.log(tokenDetails);
          // res.json({tokenDetails,message:"Valid Token"})
        }
      })
      next();
    }else{
      res.sendStatus(403);
    }
  }

export {verifyToken,verifyRefreshToken}; 