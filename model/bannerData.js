const mongoose=require("mongoose");

const bannerData= new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
 
  image:{
    type:Array,
    required:true
  },
 
 
});

module.exports=mongoose.model('banner',bannerData);
