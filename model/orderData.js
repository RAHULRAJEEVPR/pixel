const mongoose=require('mongoose')
const orderData=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    orderId:{
        type:String,
        unique:true,
        required:true
        
    },
    deliveryAddress:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    },
    product:[ {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        quantity:{
            type:Number,
            required:true,
        } ,
        singleTotal:{
          type:Number,
          required:true
      }
    }],
    total:{
        type:Number,
    },
    discount:{
        type:Number
    },
    paymentType:{
        type:String,
        required:true
    },
    returnDate:{
        type: Date,
       },
    status:{
        
            type:String,
            required:true
        },
        
    

})

module.exports=mongoose.model('order',orderData)