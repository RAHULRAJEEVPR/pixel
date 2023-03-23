const mongoose=require('mongoose')
const categoryData=mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    }
})
module.exports=mongoose.model('category',categoryData)
