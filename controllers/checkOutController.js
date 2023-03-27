const userModel = require("../model/userData");
const productModel = require("../model/productData");
const categoryModel = require("../model/categoryData");
const Cart = require("../model/cartData");
const bcrypt = require("bcrypt");
const cartData = require("../model/cartData");
const orderModel = require("../model/orderData");
const { v4: uuidv4 } = require("uuid");
const Razorpay = require("razorpay");
require("dotenv").config();
const crypto = require("crypto");
const couponModel = require("../model/couponData");

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

//load checkout page
const loadCheckOut = async (req, res) => {
  try {
    const today = Date.now();
    const coupon = await couponModel.find({ expirationDate: { $gt: today } });

    let userId = req.session.user_id;
    userData = await userModel.findOne({ _id: userId });

    if (userData) {
      const cartData = await Cart.findOne({ userId: userId }).populate(
        "products.productId"
      );

      res.render("checkout", {
        cart: cartData,
        user: userData,
        coupon: coupon,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//placerorder post
const placeOrder = async (req, res) => {
  try {
    if (req.body.address === undefined) {
      res.json({ address: true });
    } else {
      let userId = req.session.user_id;

      const orders = req.body;

      const orderDetails = [];
      const productId = req.body.proId;
      orders.product = orderDetails;

      if (!Array.isArray(orders.proId)) {
        orders.proId = [orders.proId];
      }

      if (!Array.isArray(orders.proQ)) {
        orders.proQ = [orders.proQ];
      }

      if (!Array.isArray(orders.qntyPrice)) {
        orders.qntyPrice = [orders.qntyPrice];
      }

      for (let i = 0; i < orders.proId.length; i++) {
        const productId = orders.proId[i];

        const quantity = orders.proQ[i];
        const singleTotal = orders.qntyPrice[i];
        orderDetails.push({
          productId: productId,
          quantity: quantity,
          singleTotal: singleTotal,
        });
      }

      orderStatus = [];
      newData = Date.now();

      //checking payment mode

      if (orders.payment == "cod") {
        let status = "confirmed";

        const ordersave = new orderModel({
          userId: userId,
          product: orderDetails,
          total: req.body.cartTotal,
          orderId: `order_id_${uuidv4()}`,
          deliveryAddress: orders.address,
          paymentType: orders.payment,
          date: Date.now(),
          discount: req.body.discount1,
          status: status,
        });

        const saveData = await ordersave.save();
        await couponModel.updateOne(
          { code: req.body.code },
          { $push: { userUsed: userId } }
        );

        if (saveData) {
        }
        const cartData = await Cart.updateOne(
          { userId: userId },
          { $pull: { products: { productId } } }
        );

        res.json({ status: true });
      } else if (orders.payment == "wallet") {
        let status = "pending";

        if (req.body.cartTotal < req.body.balance) {
          res.json({ wallet: true });
        } else {
          let status = "confirmed";

          const ordersave = new orderModel({
            userId: userId,
            product: orderDetails,
            total: req.body.cartTotal,
            orderId: `order_id_${uuidv4()}`,
            deliveryAddress: orders.address,
            paymentType: orders.payment,
            date: Date.now(),
            discount: req.body.discount1,
            status: status,
          });

          const saveData = await ordersave.save();
          await couponModel.updateOne(
            { code: req.body.code },
            { $push: { userUsed: userId } }
          );

          const cartData = await Cart.updateOne(
            { userId: userId },
            { $pull: { products: { productId } } }
          );

          const updatewallet = await userModel.updateOne(
            { _id: userId },
            { $inc: { wallet: -req.body.cartTotal } }
          );

          res.json({ status: true });
        }
      } else if (orders.payment == "upi") {
        let status = "Payment failed";
        const ordersave = new orderModel({
          userId: userId,
          product: orderDetails,
          total: req.body.cartTotal,
          orderId: `order_id_${uuidv4()}`,
          deliveryAddress: orders.address,
          paymentType: orders.payment,
          date: Date.now(),
          discount: req.body.discount1,
          status: status,
        });

        const saveData = await ordersave.save();
        await couponModel.updateOne(
          { code: req.body.code },
          { $push: { userUsed: userId } }
        );

        const latestOrder = await orderModel
          .findOne({})
          .sort({ date: -1 })
          .lean();

        let options = {
          amount: req.body.cartTotal * 100,
          currency: "INR",
          receipt: "" + latestOrder._id,
        };

        instance.orders.create(options, function (err, order) {
          res.json({ viewRazorpay: true, order });
        });
      } else {
        res.json({ radio: true });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//online payment verification
const verifyPayment = async (req, res) => {
  try {
    let userId = req.session.user_id;
    const details = req.body;
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);

    hmac.update(
      details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");
    const latestOrder = await orderModel.findOne({}).sort({ date: -1 }).lean();

    if (hmac == details["payment[razorpay_signature]"]) {
      const change = await orderModel.updateOne(
        { _id: latestOrder._id },
        { $set: { status: "confirmed" } }
      );
      for (let i = 0; i < latestOrder.product.length; i++) {
        const productId = latestOrder.product[i].productId;

        const cartData = await Cart.updateOne(
          { userId: userId },
          { $pull: { products: { productId } } }
        );
      }

      res.json({ status: true });
      if (change) {
      }
    } else {
      const change = await orderModel.updateOne(
        { _id: latestOrder._id },
        { $set: { status: "Payment failed" } }
      );
      res.json({ failed: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//userside order display

const userOrders = async (req, res) => {
  try {
    userId = req.session.user_id;
    const orders = await orderModel
      .find({ userId: userId })
      .sort({ date: -1 })
      .populate("product.productId");

    const Data = await userModel.findOne({ _id: req.session.user_id });

    res.render("orders", { orders, user: Data });
  } catch (error) {
    res.render("500");
    console.log(error.message);
  }
};
//user order detailed view page load
const userOrderSingleView = async (req, res) => {
  try {
    id = req.params.id;
    const Data = await userModel.findOne({ _id: req.session.user_id });
    const order = await orderModel
      .findById({ _id: id })
      .populate("product.productId")
      .populate("userId");

    res.render("ordersingle", { order: order, user: Data });
  } catch (error) {
    res.render("500");
    console.log(error.message)
  }
};

//user cancel oredr
const cancelOrders = async (req, res) => {
  try {
    let id = req.body.id;
    const paymentCheck = await orderModel.findOne({ _id: id });
    const orderData = await orderModel.updateOne(
      { _id: id },
      { $set: { status: "cancelled" } }
    );
    if (orderData) {
      const order = await orderModel.findOne({ _id: id });
      for (let i = 0; i < order.product.length; i++) {
        await productModel.updateOne(
          { _id: order.product[i].productId },
          { $inc: { stock: order.product[i].quantity } }
        );
      }
      if (order.paymentType != "cod") {
        const walletUpdated = await userModel.updateOne(
          { _id: order.userId },
          { $inc: { wallet: order.total } }
        );
      }
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//admin side orderlist
const adminLoadOrder = async (req, res) => {
  try {
    const orderData = await orderModel.find({}).sort({ date: -1 });
    res.render("adminorders", { orderData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//order success page
const orderSuccess = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userdetails = await userModel.findOne({ _id: userId });

    const latestOrder = await orderModel.findOne({}).sort({ date: -1 }).lean();

    const order = await orderModel
      .findOne({ _id: latestOrder._id })
      .populate("product.productId");
    for (let i = 0; i < order.product.length; i++) {
      await productModel.updateOne(
        { _id: order.product[i].productId },
        { $inc: { stock: -order.product[i].quantity / 2 } }
      );
    }

    res.render("ordersuccess", { order });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//admin order status change
const changeStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const newstatus = req.body.status;

    const updated = await orderModel.updateOne(
      { orderId: orderId },
      { $set: { status: newstatus } }
    );
    if (newstatus === "Delivered") {
      const today = new Date();

      let dateAfter7Days = new Date(today);
      dateAfter7Days.setDate(today.getDate() + 7);

      const re = await orderModel.updateOne(
        { orderId: orderId },
        { $set: { returnDate: dateAfter7Days } }
      );
     
    }

    if (updated && newstatus === "Returned") {
      const order = await orderModel.findOne({ orderId: orderId });
      for (let i = 0; i < order.product.length; i++) {
        await productModel.updateOne(
          { _id: order.product[i].productId },
          { $inc: { stock: order.product[i].quantity } }
        );
      }
      if (order.paymentType != "cod") {
        const walletUpdated = await userModel.updateOne(
          { _id: order.userId },
          { $inc: { wallet: order.total } }
        );
      }
    }

    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user order return request
const returnOrder = async (req, res) => {
  try {
    let id = req.body.id;

    const orderData = await orderModel.updateOne(
      { _id: id },
      { $set: { status: "Return requested" } }
    );
    if (orderData) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user addaddreess at checkout page
const addAddress = async (req, res) => {
  try {
    id = req.session.user_id;
    const userData = await userModel.updateOne(
      { _id: id },
      {
        $push: {
          address: {
            name: req.body.name,
            houseName: req.body.hname,
            street: req.body.street,
            district: req.body.district,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country,
            phone: req.body.number,
          },
        },
      }
    );
    if (userData) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin order detailed view
const orderDetails = async (req, res) => {
  try {
    id = req.params.id;

    const order = await orderModel
      .findById({ _id: id })
      .populate("product.productId")
      .populate("userId");

    res.render("orderdetails", { orderDetails: order });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
module.exports = {
  loadCheckOut,
  placeOrder,
  userOrders,
  cancelOrders,
  adminLoadOrder,
  orderSuccess,
  verifyPayment,
  changeStatus,
  returnOrder,
  addAddress,
  orderDetails,
  userOrderSingleView,
};
