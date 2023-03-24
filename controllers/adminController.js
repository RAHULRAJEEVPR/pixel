const admin = require("../model/adminData");
const userModel = require("../model/userData");
const orderModel = require("../model/orderData");
const productModel = require("../model/productData");
const adminLogin = async (req, res) => {
  try {
    res.render("adminlogin");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin login
const loginVerify = async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const adminData = await admin.findOne({ username: username });
    if (adminData) {
      if (password === adminData.password) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/dashboard");
      } else {
        res.render("adminlogin", { message: " Password is incorrect" });
      }
    } else if (username == "" && password == "") {
      res.render("adminlogin", { message: "User and passwoard required" });
    } else {
      res.render("adminlogin", { message: "Enter a valid username" });
    }
  } catch (error) {
    console.log(error.messasge);
    res.render("500");
  }
};

//admin dashborad
const loadDashboard = async (req, res) => {
  try {
    const orderData = await orderModel
      .find({})
      .sort({ date: -1 })
      .populate("product.productId")
      .populate("userId");

    //finding total customer count
    const userCount = await userModel.find({}).count();
    //total sales count
    const salesCount = await orderModel.find({ status: "Delivered" }).count();
    const totalRevenue = await orderModel.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    const salesChart = await orderModel.aggregate([
      {
        $match: {
          status: {
            $eq: "Delivered",
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sales: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: 7,
      },
    ]);
    const date = salesChart.map((item) => {
      return item._id;
    });
    const sales = salesChart.map((item) => {
      return item.sales;
    });

    const UPI = await orderModel
      .find({ paymentType: "upi", status: "Delivered" })
      .count();
    const COD = await orderModel
      .find({ paymentType: "cod", status: "Delivered" })
      .count();
    const WALLET = await orderModel
      .find({ paymentType: "wallet", status: "Delivered" })
      .count();

    res.render("dashboard", {
      userCount,
      totalRevenue,
      salesCount,
      date,
      sales,
      UPI,
      COD,
      WALLET,
      orderData,
    });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin logout
const adminLogout = async (req, res) => {
  try {
    req.session.admin_id = null;
    res.redirect("/admin");
    res.render("500");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//USERSSSS

//admin user list page
const adminUserList = async (req, res) => {
  try {
    const userData = await userModel.find({});

    res.render("userlist", { user: userData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//admin user action block/unblock
const userAction = async (req, res) => {
  try {
    id = req.params.id;

    userData = await userModel.findOne({ _id: id });
    if (userData.status) {
      await userModel.updateOne({ _id: id }, { $set: { status: false } });
      res.redirect("/admin/userlist");
    } else {
      await userModel.updateOne({ _id: id }, { $set: { status: true } });
      res.redirect("/admin/userlist");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//load sales report
const loadSales = async (req, res) => {
  try {
    res.render("sales");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

const salesReport = async (req, res) => {
  try {
    // create a new date object with the existing date
    const existingDate = new Date(req.body.to);

    // add one day to the existing date
    const newDate = new Date(existingDate);
    newDate.setDate(existingDate.getDate() + 1);

    if (req.body.from == "" || req.body.to == "") {
      res.render("sales", { message: "all fields are equired" });
    } else {
      const ss = await orderModel
        .find({
          status: "Delivered",
          date: {
            $gte: new Date(req.body.from),
            $lte: new Date(newDate),
          },
        })
        .populate("product.productId");

      res.render("salesreport", {
        ss,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

module.exports = {
  adminLogin,
  loginVerify,
  loadDashboard,
  adminLogout,
  adminUserList,
  userAction,
  loadSales,
  salesReport,
};
