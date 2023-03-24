const productModel = require("../model/productData");
const categoryModel = require("../model/categoryData");
const userModel = require("../model/userData");
const fs = require("fs");
const path = require("path");
// admin load all product
const loadProduct = async (req, res) => {
  try {
    const productData = await productModel.find({}).populate("category");
    res.render("productlist", { product: productData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin add product page
const addProduct = async (req, res) => {
  try {
    const categoryData = await categoryModel.find({ status: true });
    res.render("addproduct", { Category: categoryData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin addproduct post
const insertProduct = async (req, res) => {
  try {
    const imgArray = [];
    for (var i = 0; i < req.files.length; i++) {
      imgArray.push(req.files[i].filename);
    }

    let data = req.body.productname;
    let newProductName = data.toUpperCase();

    const newProductDetails = new productModel({
      productName: newProductName,
      category: req.body.category,
      description: req.body.description,
      stock: req.body.stock,
      price: req.body.price,
      image: imgArray,
    });
    const productData = await newProductDetails.save();

    const categoryData = await categoryModel.find({});
    res.render("addproduct", { message: "success", Category: categoryData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

// admin delete product
const deleteProduct = async (req, res) => {
  try {
    id = req.params.id;
    await productModel.deleteOne({ _id: id });
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin edit prodcut page
const editProduct = async (req, res) => {
  try {
    id = req.params.id;
    const productData = await productModel
      .findOne({ _id: id })
      .populate("category");
    const categoryData = await categoryModel.find({});
    res.render("editproduct", { product: productData, Category: categoryData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//admin edit product post
const updateProduct = async (req, res) => {
  try {
    const imgArray = [];
    for (let i = 0; i < req.files.length; i++) {
      imgArray.push(req.files[i].filename);
    }
    if (imgArray != "") {
      id = req.params.id;

      await productModel.updateOne(
        { _id: id },
        {
          $set: {
            productName: req.body.productname,
            category: req.body.category,
            description: req.body.description,
            stock: req.body.stock,
            price: req.body.price,
            image: imgArray,
          },
        }
      );

      res.redirect("/admin/productList");
    } else {
      id = req.params.id;

      await productModel.updateOne(
        { _id: id },
        {
          $set: {
            productName: req.body.productname,
            category: req.body.category,
            description: req.body.description,
            stock: req.body.stock,
            price: req.body.price,
          },
        }
      );
      res.redirect("/admin/productList");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//admin single image delete
const deleteImage = async (req, res) => {
  try {
    const imagedata = req.params.imgId;
    const proId = req.params.id;
    fs.unlink(
      path.join(__dirname, "../public/productimages", imagedata),
      () => {}
    );
    const pulled = await productModel.updateOne(
      { _id: proId },
      { $pull: { image: imagedata } }
    );

    res.redirect("/admin/productList/editproduct/" + proId);
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//admin image edit
const editImage = async (req, res) => {
  try {
    imagedata = req.files;

    const proId = req.params.id;
    const images = [];
    const len = imagedata.length;
    for (let i = 0; i < len; i++) {
      const value = await productModel.updateOne(
        { _id: proId },
        { $push: { image: imagedata[i].filename } }
      );
    }

    res.redirect("/admin/productList/editproduct/" + proId);
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//userside

//user product cateogry view
const ProductView = async (req, res) => {
  try {
    const id = req.params.id;

    const productData = await productModel
      .findOne({ _id: id })
      .populate("category");
    const categoryData = await categoryModel.find({});
    if (req.session.user_id) {
      const Data = await userModel.findOne({ _id: req.session.user_id });

      res.render("productview", {
        productDetails: productData,
        categoryData: categoryData,
        user: Data,
      });
    } else {
      res.render("productview", {
        productDetails: productData,
        categoryData: categoryData,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//admin product list/unlist
const productAction = async (req, res) => {
  try {
    const userId = req.session.user_id;
    id = req.params.id;
    data = await productModel.findOne({ _id: id });
    if (data.status) {
      const productData = await productModel.updateOne(
        { _id: id },
        { $set: { status: false } }
      );
    } else {
      const productData = await productModel.updateOne(
        { _id: id },
        { $set: { status: true } }
      );
    }

    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//user product search
const search = async (req, res) => {
  try {
    const search = req.body.search;

    const result = new RegExp(search, "i");

    // let page = 1;
    //  page=req.query.page
    // const limit = 6;

    const proData = await productModel.find({
      productName: result,
      status: true,
    });
    const Data = await userModel.findOne({ _id: req.session.user_id });

    const categoryData = await categoryModel.find({ status: true });
    // const countproducts=await productModel.find({ status: true }).countDocuments()
    // let countdata=Math.ceil(countproducts/limit)

    if (Data) {
      res.render("allproduct", {
        product: proData,
        categoryData: categoryData,
        user: Data,
      });
    } else {
      res.render("allproduct", {
        product: proData,
        categoryData: categoryData,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

module.exports = {
  loadProduct,
  addProduct,
  insertProduct,
  deleteProduct,
  editProduct,
  updateProduct,
  ProductView,
  productAction,
  search,
  deleteImage,
  editImage,
};
