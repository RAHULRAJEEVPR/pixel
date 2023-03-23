const couponModel = require("../model/couponData");
const userModel = require("../model/userData");
const productModel = require("../model/productData");
const { findOne } = require("../model/userData");

//admin coupon page load
const loadCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.find();

    res.render("coupon", { coupon });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin add coupon apage load
const loadAddCoupon = (req, res) => {
  try {
    res.render("addcoupon");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin adding new coupon
const AddCoupon = async (req, res) => {
  try {
    code = req.body.code;
    newcode = code.toUpperCase();
    const couponData = await couponModel.findOne({ code: newcode });

    if (couponData) {
      res.render("addcoupon", { message: "coupon alredy exists" });
    } else {
      const coupon = new couponModel({
        code: newcode,
        expirationDate: req.body.expdate,
        maxDiscount: req.body.maxdiscount,
        MinPurchaseAmount: req.body.minpurchaseamount,
        percentageOff: req.body.percentageoff,
      });
      const saving = await coupon.save();
      res.render("addcoupon", { message: "coupon Added" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin deleting coupon
const deleteCoupon = async (req, res) => {
  try {
    couponId = req.params.id;
    const updated = await couponModel.deleteOne({ _id: couponId });
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//user applying coupon
const applyCoupon = async (req, res) => {
  try {
    id = req.session.user_id;
    const couponDetails = await couponModel.findOne({ code: req.body.code });
    if (couponDetails) {
      const user = await userModel.findOne({ _id: id });
      const found = await couponModel.findOne({
        code: req.body.code,
        userUsed: { $in: [user._id] },
      });
      const code = couponDetails.code;

      const datenow = Date.now();
      if (found) {
        res.json({ used: true });
      } else {
        if (datenow <= couponDetails.expirationDate) {
          if (couponDetails.MinPurchaseAmount <= req.body.total) {
            let discountAmount =
              (req.body.total * couponDetails.percentageOff) / 100;

            if (discountAmount <= couponDetails.maxDiscount) {
              let discountValue = discountAmount;
              let value = req.body.total - discountValue;
              res.json({ amountokay: true, value, discountValue, code });
            } else {
              let discountValue = couponDetails.maxDiscount;
              let value = req.body.total - discountValue;
              res.json({ amountokay: true, value, discountValue, code });
            }
          } else {
            res.json({ amountnokay: true });
          }
        } else {
          res.json({ datefailed: true });
        }
      }
    } else {
      res.json({ invalid: true });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin edit coupon page
const LoadEditCoupon = async (req, res) => {
  try {
    id = req.params.id;
    const coupon = await couponModel.findOne({ _id: id });
    res.render("editcoupon", { coupon });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin updating coupon
const updateCoupon = async (req, res) => {
  try {
    const id = req.body.id;

    code = req.body.code;

    newcode = code.toUpperCase();
    const couponData = await couponModel.findOne({ code: newcode });
    const coupon = await couponModel.findOne({ _id: id });
    if (couponData.id != id) {
      res.render("editcoupon", {
        coupon,
        message: "another coupon exists in this code",
      });
    } else {
      const updated = await couponModel.updateOne(
        { _id: id },
        {
          $set: {
            code: newcode,
            expirationDate: req.body.expdate,
            maxDiscount: req.body.maxdiscount,
            MinPurchaseAmount: req.body.minpurchaseamount,
            percentageOff: req.body.percentageoff,
          },
        }
      );
      if (updated) {
        res.redirect("/admin/coupon");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
module.exports = {
  loadCoupon,
  loadAddCoupon,
  AddCoupon,
  deleteCoupon,
  applyCoupon,
  LoadEditCoupon,
  updateCoupon,
};
