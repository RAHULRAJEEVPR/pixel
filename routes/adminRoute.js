//express
const express=require("express")
const adminRoute=express()
//admin auth middileware
const auth=require('../middlewares/auth')
//multer
const upload=require('../middlewares/multer')
//view engine
adminRoute.set('views','views/admin')

//Requiring Controllers
const adminController=require('../controllers/adminController')
const categoryController=require('../controllers/categoryController')
const productController=require('../controllers/productController')
const checkOutController=require('../controllers/checkOutController')
const couponController=require('../controllers/couponController')
const bannerController=require('../controllers/bannerController')
//end..........................................................

//admin login/logout .................
adminRoute.get('/',auth.isLogout,adminController.adminLogin)
adminRoute.post('/',adminController.loginVerify)
adminRoute.get('/logout',auth.isLogin,adminController.adminLogout)
adminRoute.get('/dashboard',auth.isLogin,adminController.loadDashboard)


//admin category routes.........................
adminRoute.get('/category',auth.isLogin,categoryController.loadCategory)
adminRoute.get('/category/addcategory',auth.isLogin,categoryController.addCategorypage)
adminRoute.post('/category/addcategory',auth.isLogin,categoryController.insertCategory)
adminRoute.get('/category/editcategory/:id',auth.isLogin,categoryController.editCategoryPage)
adminRoute.post('/category/editcategory/:id',auth.isLogin,categoryController.updateCategory)
adminRoute.get('/category/deletecategory/:id',auth.isLogin,categoryController.deleteCategory)
adminRoute.get('/category/actioncategory/:id',auth.isLogin,categoryController.catAction)

//admin product routes....................................................
adminRoute.get('/productList',auth.isLogin,productController.loadProduct)
adminRoute.get('/addproduct',auth.isLogin,productController.addProduct)
adminRoute.post('/addproduct',upload.array('image'),auth.isLogin,productController.insertProduct)
adminRoute.get('/productList/deleteproduct/:id',auth.isLogin,productController.deleteProduct)
adminRoute.get('/productList/editproduct/:id',auth.isLogin,productController.editProduct)
adminRoute.post('/productList/editproduct/:id',upload.array('image'),auth.isLogin,productController.updateProduct)
adminRoute.get('/productList/deleteImage/:id/:imgId',auth.isLogin,productController.deleteImage)
adminRoute.post('/productList/editImage/:id',upload.array('image'),auth.isLogin,productController.editImage)
adminRoute.get('/productList/productAction/:id',auth.isLogin,productController.productAction)

//admin user routes...................................................
adminRoute.get('/userlist',auth.isLogin,adminController.adminUserList)
adminRoute.get('/userlist/action/:id',auth.isLogin,adminController.userAction)

//admin order routes...................
adminRoute.get('/orders',auth.isLogin,checkOutController.adminLoadOrder)
adminRoute.post('/orders',auth.isLogin,checkOutController.changeStatus)
adminRoute.get('/orders/orderDetails/:id',auth.isLogin,checkOutController.orderDetails)

//admin coupon routes......................................................
adminRoute.get('/coupon',auth.isLogin,couponController.loadCoupon)
adminRoute.get('/coupon/addcoupon',auth.isLogin,couponController.loadAddCoupon)
adminRoute.post('/coupon/addcoupon',auth.isLogin,couponController.AddCoupon)
adminRoute.get('/coupon/delete/:id',auth.isLogin,couponController.deleteCoupon)
adminRoute.get('/coupon/edit/:id',auth.isLogin,couponController.LoadEditCoupon)
adminRoute.post('/coupon/edit/:id',auth.isLogin,couponController.updateCoupon)

//admin banner routes...................................................
adminRoute.get("/Banner",auth.isLogin,bannerController.adminBannerPage)
adminRoute.get('/banner/addbanner',auth.isLogin,bannerController.loadAddBanner)
adminRoute.post('/banner/addbanner',upload.array('image',1),auth.isLogin,bannerController.AddBanner)
adminRoute.get('/banner/delete/:id',auth.isLogin,bannerController.deleteBanner)

//admin sales report routes...................................................
adminRoute.get('/sales',auth.isLogin,adminController.loadSales)
adminRoute.post('/sales',auth.isLogin,adminController.salesReport)

//admin error page
adminRoute.use(function(req,res,next){
  res.render('404')
})

module.exports=adminRoute
