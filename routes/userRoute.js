const express=require("express")
const userRoute=express()
const path=require('path')
const auth=require('../middlewares/auth')
const bcrypt = require('bcrypt');
//view engine

userRoute.set('views','views/user')



//............CONTROLLERS...............
const userController=require('../controllers/userController')
const productController=require('../controllers/productController')
const cartController=require('../controllers/cartController')
const wishlistController=require('../controllers/wishlistController')
const checkOutController=require('../controllers/checkOutController')
const couponController=require('../controllers/couponController')


userRoute.get('/',userController.loadUserHome)

//.....USER LOGIN AND SIGNUP
userRoute.get('/login',auth.userLogout,userController.loadLogin)
userRoute.post('/login',userController.userLogin)
userRoute.get('/signup',userController.loadSignup)
userRoute.post('/signup',userController.userSignup)
userRoute.post('/verifyotp',userController.verifyOtp)
userRoute.get('/logout',userController.userLogout)

//product views
userRoute.get('/productview/:id',productController.ProductView)
userRoute.get('/products',userController.loadAllProducts)
userRoute.get('/catview/:id',userController.loadbycategory)
userRoute.post('/prosearch',productController.search)



//user profile
userRoute.get('/userprofile/:id',auth.userLogin,userController.userProfileLoader)
userRoute.get('/userprofile/editprofile/:id',auth.userLogin,userController.loadUserEdit)
userRoute.post('/userprofile/editprofile/:id',auth.userLogin,userController.updateUserDetails)
userRoute.get('/userprofile/AddAddress/:id',auth.userLogin,userController.loadAddAddress)
userRoute.post('/userprofile/AddAddress/:id',auth.userLogin,userController.addAddress)
userRoute.get('/userprofile/viewaddress/:id',auth.userLogin,userController.loadViewAddress)
userRoute.post('/userprofile/viewaddress/deletead',auth.userLogin,userController.deleteAddress)
userRoute.get('/userprofile/changepass/:id',auth.userLogin,userController.changePass)
userRoute.post('/userprofile/changepass/:id',auth.userLogin,userController.updatePass)
userRoute.get('/userprofile/viewaddress/editaddress/:id',auth.userLogin,userController.editAddress)
userRoute.post('/userprofile/viewaddress/editaddress/:id',auth.userLogin,userController.updateAddress)
userRoute.get('/userprofile/order/:id',auth.userLogin,checkOutController.userOrders)
userRoute.get('/userprofile/orders/orderDetails/:id',checkOutController.userOrderSingleView)
//cart
userRoute.get('/cart',auth.userLogin,cartController.loadCart)
userRoute.post('/addtocart',cartController.addToCart)
userRoute.get('/cart/detelecartproduct/:id',auth.userLogin,cartController.deleteCart)
userRoute.post('/cart/change-product-quantity',auth.userLogin,cartController.changeQuantity)
//stockverify
userRoute.post('/cart/stockverify',auth.userLogin,cartController.cartStockVerify)
userRoute.get('/cart/checkout',auth.userLogin,checkOutController.loadCheckOut)




//......forgot pass..............
//forgot pass landpage
userRoute.get('/forgotpass',userController.forgotPass)

//forgot pass otp sent post
userRoute.post('/forgotpass',userController.forgotPassPost)

//forgot pass otp verifcation
userRoute.post('/forgotverifyotp',userController.forgotChangePassopt)

//setting new pass through forgotpass
userRoute.post('/newpass',userController.forgotNewPass)


//wishlist
userRoute.get('/wishlist',auth.userLogin,wishlistController.loadWishlist)
userRoute.post('/addtowishlist',auth.userLogin,wishlistController.addWishlist)
userRoute.post('/wishlist/wishtocart',auth.userLogin,wishlistController.wishToCart)
userRoute.post('/wishlist/deletewish',auth.userLogin,wishlistController.deleteWish)

// USER CHECKOUT ROUTES.....................................................................
userRoute.get('/cart/checkout',auth.userLogin,checkOutController.loadCheckOut)
//order success page
userRoute.get('/success',auth.userLogin,checkOutController.orderSuccess)
//online payment verify post
userRoute.post('/verify-payment',auth.userLogin,checkOutController.verifyPayment)
//user order placeing
userRoute.post('/placeorder',auth.userLogin,checkOutController.placeOrder)
//user cancel order post
userRoute.post('/usercancelorder',auth.userLogin,checkOutController.cancelOrders)
//coupen apply ajax
userRoute.post('/applayCoupon',auth.userLogin,couponController.applyCoupon),
//user order return
userRoute.post('/userreturnorder',auth.userLogin,checkOutController.returnOrder)
//checkout page add address
userRoute.post('/checkoutAddAddress',auth.userLogin,checkOutController.addAddress)


//PAGE NOT FOUNF HANDLEING
userRoute.use(function(req,res,next){
    res.render('404')
  })
  

module.exports=userRoute