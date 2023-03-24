const userModel = require("../model/userData");
const productModel = require("../model/productData");
const categoryModel = require("../model/categoryData");
const Cart = require("../model/cartData");
const bcrypt = require("bcrypt");
const cartData = require("../model/cartData");
const userData = require("../model/userData");

//load wishlist page
const loadWishlist = async (req, res) => {
  try {
    session = req.session.user_id;
    const userData = await userModel
      .findOne({ _id: session })
      .populate("wishlist.product");
    const productData = await productModel.find({}).populate("category");
    const categoryData = await categoryModel.find({});
    res.render("wishlist", {
      user: userData,
      categoryData: categoryData,
      productData: productData,
    });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//addtowislist post
const addWishlist = async (req, res) => {
  try {
    userId = req.session.user_id;
    proId = req.body.productId;

    const data = await userModel.findOne({
      _id: userId,
      "wishlist.product": proId,
    });
    if (data) {
      res.json({ success: true });
    } else {
      const insert = await userModel.updateOne(
        { _id: userId },
        { $push: { wishlist: { product: proId } } }
      );

      if (insert) {
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//wishlist to cart
const wishToCart = async (req, res) => {
  try {
    userId = req.session.user_id;
    proId = req.body.proId;
    proPrice = req.body.proPrice;
    productId = proId;

    //checking is this product is there in cart
    let exists = await Cart.findOne({
      userId: userId,
      "products.productId": proId,
    });
    //finding if cart is there for user
    let cartfound = await Cart.findOne({ userId: userId });

    if (exists) {
      const removeFromWish = await userModel.updateOne(
        { _id: userId },
        { $pull: { wishlist: { product: proId } } }
      );
      res.json({ success: true });
    } else if (cartfound) {
      let toCart = await Cart.updateOne(
        { userId: userId },
        {
          $push: {
            products: { productId: proId, quantity: 1, totalPrice: proPrice },
          },
        }
      );

      if (toCart) {
        let cart = await Cart.findOne({ userId }).populate(
          "products.productId"
        );

        let cartTotal = 0;
        for (let i = 0; i < cart.products.length; i++) {
          cartTotal += cart.products[i].totalPrice;
        }
        const total = await Cart.updateOne(
          { userId: userId },
          { $set: { cartTotalPrice: cartTotal } }
        );

        const removeFromWish = await userModel.updateOne(
          { _id: userId },
          { $pull: { wishlist: { product: proId } } }
        );
      }

      res.json({ success: true });
    } else {
      // If the user does not have a cart, create a new one
      cart = new Cart({ userId, products: [] });

      const product = await productModel.findById(proId);
      let totalPrice = product.price;

      let quantity = 1;
      cart.products.push({ productId, quantity, totalPrice });
      await cart.save();

      let cartTotal = 0;
      for (let i = 0; i < cart.products.length; i++) {
        cartTotal += cart.products[i].totalPrice;
      }
      const total = await Cart.updateOne(
        { userId: userId },
        { $set: { cartTotalPrice: cartTotal } }
      );

      const removeFromWish = await userModel.updateOne(
        { _id: userId },
        { $pull: { wishlist: { product: proId } } }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//deleting from wishlist
const deleteWish = async (req, res) => {
  try {
    userId = req.session.user_id;
    proId = req.body.proId;

    const removeFromWish = await userModel.updateOne(
      { _id: userId },
      { $pull: { wishlist: { product: proId } } }
    );
    if (removeFromWish) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

module.exports = {
  loadWishlist,
  addWishlist,
  wishToCart,
  deleteWish,
};
