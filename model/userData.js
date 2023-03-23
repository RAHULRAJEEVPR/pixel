const mongoose = require("mongoose");
const userData = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  address: [
    {
      name:{
        type: String,
        required: true,
      },
      houseName: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type:Number,
        required: true,
      },
    },
  ],
  wallet:{
    type:Number,
    default:0
  },
  wishlist:[{
    product:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"product",
      required:true
    }
  }]
});
module.exports = mongoose.model("user", userData);
