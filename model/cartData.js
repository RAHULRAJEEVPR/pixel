const mongoose=require("mongoose")
const cartData=mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
   },
   products:[{
    productId:{
        type:mongoose.Schema.Types.ObjectId,
    ref:"product",
    required:true
    },
    quantity:{
        type:Number,
        default:1,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
        
    }
   }],
   cartTotalPrice:{
    type:Number,
    
   }
})

module.exports=mongoose.model('cart',cartData)