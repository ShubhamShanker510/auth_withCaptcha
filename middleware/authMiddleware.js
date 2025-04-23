const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{
    const token=req.cookies.token || req.headers['authorization'];

    if(!token){
        return res.redirect('/login');
    }


    try {

        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user=decoded;
        next();
        
    } catch (error) {
        console.error("Error verifying token",error);
        return res.redirect('/login');

    }
}