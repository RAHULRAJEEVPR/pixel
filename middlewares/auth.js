const userModel = require("../model/userData");
const isLogin=async(req,res,next)=>{
    try {
        
        if(req.session.admin_id){


        }else{
            console.log('admin potti')
           return res.redirect('/admin');
        }
        next()
    } catch (error) {
        console.log(error.message)
        
    }
}


const isLogout=async(req,res,next)=>{
    try {
        
        if(req.session.admin_id){
            
        return    res.redirect("/admin/dashboard")
        }
        next();
    } catch (error) {
        console.log(error.message)
        
    }
}



const userLogin = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        let user = await userModel.findOne({ _id: req.session.user_id });
        
        if (user.status === false) {
          
          req.session.user_id=null
          console.log("user ne erakkivittu");
          return res.redirect("/login");
        } else {
          next(); // move next() here
        }
      } else {
        console.log("user potti");
        return res.redirect("/login");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  

const userLogout=async(req,res,next)=>{
    try {
        
        if(req.session.user_id){
            return    res.redirect('/')
        }else{
            
        }
        next()
    } catch (error) {
        console.log(error.message)
        
    }
   
}
module.exports ={isLogin,
                 isLogout,
                 userLogin,
                 userLogout
 }