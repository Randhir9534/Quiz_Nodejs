const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const token= req.query.token || req.headers['x-access-token'] || req.headers['authorization']||req.body.token
    if(!token){
        return res.status(400).json({
            status:false,
            message:"Token is required for authentication"
        })
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user=decoded
        console.log("after login user", req.user);

    }catch(e){
        return res.status(400).json({
            status:false,
            messase:"invalid token"
        })
    }
    return next()
  }