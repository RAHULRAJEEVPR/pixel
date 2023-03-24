const bannerModel = require("../model/bannerData");

//banner list page
const adminBannerPage = async (req, res) => {
  try {
    const bannerData = await bannerModel.find({});
    res.render("banner", { banner: bannerData });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//load add banner page
const loadAddBanner = (req, res) => {
  try {
    res.render("addbanner");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};

//adding new banner
const AddBanner = async (req, res) => {
  try {
    const images = [];
    for (file of req.files) {
      images.push(file.filename);
    }
    const banner = new bannerModel({
      name: req.body.name,
      image: images,
    });
    const saved = await banner.save();
    if (saved) {
      res.render("addbanner", { message: "added successfully" });
    } else {
      res.render("addbanner", { message: "failed" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
//deleting banner
const deleteBanner = async (req, res) => {
  try {
    id = req.params.id;

    const deletead = await bannerModel.deleteOne({ _id: id });

    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
module.exports = {
  adminBannerPage,
  loadAddBanner,
  AddBanner,
  deleteBanner,
};
