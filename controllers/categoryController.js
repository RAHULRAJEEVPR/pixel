const categoryModel = require("../model/categoryData");
//admin load category page
const loadCategory = async (req, res) => {
  try {
    const categoryData = await categoryModel.find({});

    res.render("category", { Category: categoryData });
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};

//admin add new category page load
const addCategorypage = async (req, res) => {
  try {
    res.render("addcategory");
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};
//addind new cateogry
const insertCategory = async (req, res) => {
  try {
    const inputcategory = req.body.category;
    const casecheck = inputcategory.toUpperCase();
    

    let collectionData = await categoryModel.findOne({ category: casecheck });
    if (collectionData) {
      res.render("addcategory", { message: "category already exists" });
      collectionData=null
    //   console.log(collectionData);
    } else {
      
        const category = new categoryModel({
        category: casecheck,
        description: req.body.description,
      });
      const categoryData = await category.save();
      if (categoryData) {
        res.render("addcategory", { message: "added successfully" });
      } else {
        res.render("addcategory", { message: "faild" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};

//admin edit cateogry page
const editCategoryPage=async(req,res)=>{
try {
    const id=req.params.id
    
    const categoryData=await categoryModel.findOne({_id:id})
    if(categoryData){
        res.render('editcategory',{category:categoryData})
    }
    
} catch (error) {
    console.log(error.message);
    res.render('500')
}
}
//admin updating category
const updateCategory=async(req,res)=>{
    try {
      let newdata=req.body.category
      let newCategory=newdata.toUpperCase()
      let newdescription=req.body.description
      let id=req.params.id
      


      const Data=await categoryModel.findOne({category:newCategory})
      if(Data &&Data._id !=id){
        res.render("editcategory", { message: "category already exists" ,category:Data});
      }else{
        const categoryData=await categoryModel.findById(id)
        if(categoryData.category==newCategory){
          if(categoryData.description==newdescription){
            res.render("editcategory", { message: "no changes made" ,category:categoryData});
          }else{
            await categoryModel.updateOne({_id:id},{$set:{description:newdescription}})
          res.redirect('/admin/category')
          }
        }else{
          await categoryModel.updateOne({_id:id},{$set:{category:newCategory,description:newdescription}})
          res.redirect('/admin/category')
        }
      }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//admin deleting cateogry
const deleteCategory=async(req,res)=>{
  try {
       const id=req.params.id
       await categoryModel.deleteOne({_id:id})
       res.redirect('/admin/category')
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}


//admin category lsit/unlist
const catAction=async(req,res)=>{
  try {
    const id=req.params.id
const catData  =    await categoryModel.findOne({_id:id})
if(catData.status){
  
  await categoryModel.updateOne({_id:id},{$set:{status:false}})
  res.redirect('/admin/category')
}else{
  await categoryModel.updateOne({_id:id},{$set:{status:true}})
  res.redirect('/admin/category')
}
      
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

module.exports = {
  loadCategory,
  addCategorypage,
  insertCategory,
  editCategoryPage,
  updateCategory,
  deleteCategory,
  catAction
};
