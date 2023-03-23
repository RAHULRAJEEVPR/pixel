const userModel = require("../model/userData");
const productModel = require("../model/productData");
const categoryModel = require("../model/categoryData");
const Cart = require("../model/cartData");
const { response } = require("../routes/userRoute");

//load cart page
const loadCart = async (req, res) => {
  try {
    let userId = req.session.user_id;
    userData = await userModel.findOne({ _id: userId });

    if (userId) {
      const cartData = await Cart.findOne({ userId: userId }).populate(
        "products.productId"
      );
      if (cartData) {
        let cartTotal = 0;
        for (let i = 0; i < cartData.products.length; i++) {
          cartTotal += cartData.products[i].totalPrice;
        }
        const total = await Cart.updateOne(
          { userId: userId },
          { $set: { cartTotalPrice: cartTotal } }
        );

        res.render("cart", { user: userData, product: cartData });
      } else {
        res.render("cart", { user: userData });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};

//addtocart post

const addToCart = async (req, res) => {
  

  try {

    const userId = req.session.user_id;
  const productId = req.body.productId;
  let quantity = 1
  let totalPrice;
  
    if (userId) {
      // Check if the user already has a cart
      let cart = await Cart.findOne({ userId }).populate("products.productId");

      if (!cart) {
        // If the user does not have a cart, create a new one
        cart = new Cart({ userId, products: [] });
      }

      // Check if the product is already in the cart
      const existingProduct = cart.products.find(
        (p) => p.productId._id.toString() === productId.toString()
      );

      if (existingProduct) {
        res.json({success:true,exists:true})
      } else {
        // If the product is not in the cart, add it

        const product = await productModel.findById(productId);
        let totalPrice = product.price;

        cart.products.push({ productId, quantity, totalPrice });
        // Save the cart
      await cart.save();

      let cartTotal = 0;
      for (let i = 0; i < cart.products.length; i++) {
        cartTotal += cart.products[i].totalPrice;
      }
      const total = await Cart.updateOne(
        { userId: userId },
        { $set: { cartTotalPrice: cartTotal } }
      );

      // res.redirect(req.headers.referer || "/");
      res.json({success:true,added:true})
      } 
    } else {
      res.json({success:true,nouser:true})
    }
  } catch (err) {
    console.error(err);
    res.render('500')
  }
};
//delete cart
const deleteCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const proId = req.params.id;
    
    await Cart.updateOne(
      { userId: userId },
      { $pull: { products: { productId: proId } } }
    );
    let cart = await Cart.findOne({ userId }).populate("products.productId");

    let cartTotal = 0;
    for (let i = 0; i < cart.products.length; i++) {
      cartTotal += cart.products[i].totalPrice;
    }
    const total = await Cart.updateOne(
      { userId: userId },
      { $set: { cartTotalPrice: cartTotal } }
    );

    // const cartData = await Cart.findOne({userId:userId}).populate('products.productId');
    //  res.render('cart',{user:userId,product:cartData});
    if (total) {
      res.json({done:true})
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};
//changer product quntity in cart
const changeQuantity = async (req, res) => {
  try {
    if (req.session.user_id) {
      
      userid = req.session.user_id;
      const proId = req.body.product;
      const count = req.body.count;
      const price = req.body.productprice;
      userId=req.body.userId
      //updaitng product quantity
      const changeProductQuantity = await Cart.updateOne(
        { userId: userid, "products.productId": proId },
        { $inc: { "products.$.quantity": count } }
      );

      //updating totalprice

      // const qty=await Cart.findOne({userId: userid,"products.productId": proId })

      const qty = await Cart.findOne(
        { userId: userid, products: { $elemMatch: { productId: proId } } },
        { "products.$": 1 }
      );

      const proTotal = qty.products[0].quantity * price;

      const newProTotal = await Cart.updateOne(
        { userId: userid, "products.productId": proId },
        { $set: { "products.$.totalPrice": proTotal } }
      );

      let cart = await Cart.findOne({ userId }).populate("products.productId");

      let cartTotal = 0;
      for (let i = 0; i < cart.products.length; i++) {
        cartTotal += cart.products[i].totalPrice;
      }
      const total = await Cart.updateOne(
        { userId: userid },
        { $set: { cartTotalPrice: cartTotal } }
      );
     

      res.json({ success: true, proTotal, cartTotal });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};

const cartStockVerify = async (req, res) => {
  try {
    console.log("hai")
    let userId = req.session.user_id;
    if (userData) {
      const cartData = await Cart.findOne({ userId: userId }).populate(
        "products.productId"
      );
     
    
      for (let i = 0; i < cartData.products.length; i++) {
        const productInCart = cartData.products[i];
        const productInStock = await productModel.findOne({ _id: productInCart.productId })

        if (productInCart.quantity > productInStock.stock) {
          console.log("Quantity in cart exceeds stock for product", productInStock.productName);
       let  name=productInStock.productName
          res.json({noStock:true, name})
        } else {
          console.log("Sufficient stock for product", productInStock.productName);
          res.json({success:true})
        }
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}


module.exports = {
  loadCart,
  addToCart,

  deleteCart,
  changeQuantity,
  cartStockVerify
};
