const userModel = require("../model/userData");
const productModel = require("../model/productData");
const categoryModel = require("../model/categoryData");
const Cart = require("../model/cartData");
const bcrypt = require("bcrypt");
const cartData = require("../model/cartData");
const orderModel = require("../model/orderData");
const bannerModel = require("../model/bannerData");
require("dotenv").config();

//password hashing
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {}
};

//loading user home page
const loadUserHome = async (req, res) => {
  try {
    const banner = await bannerModel.find({});

    const newProductData = await productModel
      .find({ status: true })
      .sort({ _id: -1 })
      .limit(5)
      .populate("category");
    const categoryData = await categoryModel.find({ status: true });
    const premium = await productModel
      .find({ status: true })
      .sort({ price: -1 })
      .limit(5)
      .populate("category");
    const budget = await productModel
      .find({ status: true })
      .sort({ price: 1 })
      .limit(5)
      .populate("category");
    const bannerlink = await categoryModel.findOne({ category: "SONY" });
    if (newProductData) {
      if (req.session.user_id) {
        session = req.session.user_id;
        userData = await userModel.findOne({ _id: session });

        res.render("userhome", {
          user: userData,
          product: newProductData,
          categoryData: categoryData,
          banner: banner,
          premium: premium,
          budget: budget,
          bannerlink: bannerlink,
        });
      } else {
        res.render("userhome", {
          product: newProductData,
          categoryData: categoryData,
          banner: banner,
          premium: premium,
          budget: budget,
          bannerlink: bannerlink,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//loading login page
const loadLogin = (req, res) => {
  try {
    res.render("userlogin");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//login page post
const userLogin = async (req, res) => {
  try {
    const newemail = req.body.email;
    const newpassword = req.body.password;

    const userData = await userModel.findOne({ email: newemail });
    if (userData) {
      if (userData.status) {
        if (bcrypt.compareSync(newpassword, userData.password)) {
          req.session.user_id = userData._id;
          res.redirect("/");
        } else {
          res.render("userlogin", { message: "invalid  password" });
        }
      } else {
        res.render("userlogin", { message: "your account has been blocked " });
      }
    } else if (newemail == "" || newpassword == "") {
      res.render("userlogin", { message: "email and password required" });
    } else {
      res.render("userlogin", { message: "enter valid email and password " });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//..............................................

//twlio...............

const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authtoken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountsid, authtoken);

const { objectId } = require("mongodb");
const { findOne } = require("../model/productData");

let session;

//user signup page load
const loadSignup = (req, res) => {
  try {
    res.render("usersignup");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user signup post
const userSignup = async (req, res) => {
  try {
    req.session.user = req.body;
    const found = await userModel.findOne({ email: req.body.email });
    if (found) {
      res.render("usersignup", { message: "email already exist ,try another" });
    } else if (
      req.body.name == "" ||
      req.body.email == "" ||
      req.body.password == ""
    ) {
      res.render("usersignup", { message: "All fields are required" });
    } else {
      phonenumber = req.body.number;
      const otpResponse = await client.verify.v2
        .services("VA8add9ca93dd5317c04dac3f19513417d")
        .verifications.create({
          to: `+91${phonenumber}`,
          channel: "sms",
        });
      res.render("otppage");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//otp verificaiton
const verifyOtp = async (req, res, next) => {
  try {
    const otp = req.body.otp;
    req.session.user;
    const details = req.session.user;

    const verifiedResponse = await client.verify.v2
      .services("VA8add9ca93dd5317c04dac3f19513417d")
      .verificationChecks.create({
        to: `+91${details.number}`,
        code: otp,
      });
    if (verifiedResponse.status === "approved") {
      details.password = await securePassword(details.password);
      const userdata = new userModel({
        Name: details.name,
        email: details.email,
        password: details.password,
        number: details.number,
      });
      const userData = await userdata.save();
      if (userData) {
        res.redirect("/");
      } else {
        res.render("otppage", { message: "invalid otp" });
      }
    } else {
      res.render("otppage", { message: "invalid otp" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user logout
const userLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user profile page
const userProfileLoader = async (req, res) => {
  try {
    id = req.params.id;
    userData = await userModel.findOne({ _id: id });

    res.render("userprofile", { user: userData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user profile edit page
const loadUserEdit = async (req, res) => {
  try {
    id = req.params.id;
    userData = await userModel.findOne({ _id: id });

    res.render("editprofile", { user: userData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user profile update post
const updateUserDetails = async (req, res) => {
  try {
    id = req.params.id;

    userData = await userModel.findOneAndUpdate(
      { _id: id },
      { $set: { Name: req.body.name, number: req.body.number } }
    );
    if (userData) {
      Data = await userModel.findOne({ _id: id });
      res.render("userprofile", { user: Data });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user profile add adress page
const loadAddAddress = async (req, res) => {
  try {
    id = req.session.user_id;
    Data = await userModel.findOne({ _id: id });
    res.render("addaddress", { user: Data });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//add address post
const addAddress = async (req, res) => {
  try {
    id = req.session.user_id;
    const userData = await userModel.updateOne(
      { _id: id },
      {
        $push: {
          address: {
            name: req.body.name,
            houseName: req.body.housename,
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
    const Data = await userModel.findOne({ _id: id });

    res.render("userprofile", { user: Data });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user all product load
const loadAllProducts = async (req, res) => {
  try {
    let page = 1;
    page = req.query.page;
    const limit = 6;

    const categoryData = await categoryModel.find({ status: true });
    const allProduct = await productModel
      .find({ status: true })
      .populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const Data = await userModel.findOne({ _id: req.session.user_id });

    const countproducts = await productModel
      .find({ status: true })
      .countDocuments();
    let countdata = Math.ceil(countproducts / limit);

    if (allProduct) {
      if (Data) {
        res.render("allproduct", {
          product: allProduct,
          categoryData: categoryData,
          user: Data,
          countproducts: countdata,
        });
      } else {
        res.render("allproduct", {
          product: allProduct,
          categoryData: categoryData,
          countproducts: countdata,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user product load by category
const loadbycategory = async (req, res) => {
  try {
    let page = 1;
    page = req.query.page;
    const limit = 6;

    const categoryData = await categoryModel.find({ status: true });

    catId = req.params.id;
    const allProduct = await productModel
      .find({ category: catId, status: true })
      .populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const Data = await userModel.findOne({ _id: req.session.user_id });

    const countproducts = await productModel
      .find({ category: catId, status: true })
      .countDocuments();
    let countdata = Math.ceil(countproducts / limit);

    if (allProduct) {
      if (Data) {
        res.render("products", {
          product: allProduct,
          categoryData: categoryData,
          user: Data,
          countproducts: countdata,
        });
      } else {
        res.render("products", {
          product: allProduct,
          categoryData: categoryData,
          countproducts: countdata,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user all address view
const loadViewAddress = async (req, res) => {
  try {
    id = req.params.id;

    const Data = await userModel.findOne({ _id: req.session.user_id });

    res.render("viewaddress", { user: Data });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

// user address delete
const deleteAddress = async (req, res) => {
  try {
    addressid = req.body.id;
    const userId = req.session.user_id;
    const userData = await userModel.updateOne(
      { _id: userId },
      { $pull: { address: { _id: addressid } } }
    );
    if (userData) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//forgot password landing page
const forgotPass = async (req, res) => {
  try {
    res.render("forgotnumber");
  } catch (error) {}
};
//forgot pass pass otp sent
const forgotPassPost = async (req, res) => {
  try {
    req.session.user = req.body;
    const found = await userModel.findOne({
      email: req.body.email,
      number: req.body.number,
    });

    if (found) {
      phonenumber = req.body.number;

      const otpResponse = await client.verify.v2
        .services("VA8add9ca93dd5317c04dac3f19513417d")
        .verifications.create({
          to: `+91${phonenumber}`,
          channel: "sms",
        });
      res.render("forgotpassotp");
    } else if (req.body.email == "" || req.body.number == "") {
      res.render("forgotnumber", { message: "All fields are required" });
    } else {
      res.render("forgotnumber", { message: "invalid email or number" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//forgot pass otp verification
const forgotChangePassopt = async (req, res) => {
  const otp = req.body.otp;
  try {
    req.session.user;
    const details = req.session.user;

    const verifiedResponse = await client.verify.v2
      .services("VA8add9ca93dd5317c04dac3f19513417d")
      .verificationChecks.create({
        to: `+91${details.number}`,
        code: otp,
      });

    if (verifiedResponse.status === "approved") {
      res.render("forgotnewpass");
    } else {
      res.render("otppage", { message: "invalid otp" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//settting new password
const forgotNewPass = async (req, res) => {
  try {
    const details = req.session.user;
    newpassword = await securePassword(req.body.password);

    const userData = await userModel.updateOne(
      { email: details.email },
      { $set: { password: newpassword } }
    );
    if (userData) {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//user password change page
const changePass = async (req, res) => {
  try {
    id = req.params.id;
    const user = await userModel.findOne({ _id: id });
    res.render("changepass", { user });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//user changeing password
const updatePass = async (req, res) => {
  try {
    id = req.params.id;
    newpassword = req.body.newpassword;
    currentpassword = req.body.currentpassword;

    const user = await userModel.findOne({ _id: id });
    if (bcrypt.compareSync(currentpassword, userData.password)) {
      newpassword = await securePassword(newpassword);

      const updated = await userModel.updateOne(
        { _id: id },
        { $set: { password: newpassword } }
      );
      res.render("changepass", { user, message: "passsword changed" });
    } else {
      res.render("changepass", { user, message: "invalid current password" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//user edit address page
const editAddress = async (req, res) => {
  try {
    addressid = req.params.id;
    userId = req.session.user_id;

    const user = await userModel.findOne({ _id: userId });
    const address = await userModel.findOne(
      { _id: userId, "address._id": addressid },
      { "address.$": 1, _id: 0 }
    );
    if (user) {
      res.render("editaddress", { address, user });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//user updating address
const updateAddress = async (req, res) => {
  try {
    addressid = req.params.id;
    userId = req.session.user_id;
    const updated = await userModel.updateOne(
      { _id: userId, "address._id": addressid },
      {
        $set: {
          "address.$": {
            name: req.body.name,
            houseName: req.body.housename,
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
    if (updated) {
      res.redirect("/userprofile/viewaddress/:id");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

module.exports = {
  loadUserHome,
  loadLogin,
  userLogin,
  loadSignup,
  userSignup,
  verifyOtp,
  userLogout,
  userProfileLoader,
  loadUserEdit,
  updateUserDetails,
  loadAddAddress,
  addAddress,
  loadAllProducts,
  loadbycategory,
  loadViewAddress,
  deleteAddress,
  forgotPass,
  forgotPassPost,
  forgotChangePassopt,
  forgotNewPass,
  changePass,
  updatePass,
  editAddress,
  updateAddress,
};
