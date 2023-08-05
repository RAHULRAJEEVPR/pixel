const mongoose =require('mongoose')
require("dotenv").config();
mongoose.connect(process.env.URL) .then(() => {
  console.log("DB connition sucessfull");
})

const express=require('express')
const app=express()
const nocache=require('nocache')
app.use(express.urlencoded({extended:false}))
const adminRoute=require('./routes/adminRoute')
const userRoute=require('./routes/userRoute')

//seting view engine
app.set('view engine','ejs')

//session
const session = require('express-session')
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true
}));

//nocache
app.use(nocache())

//path
const path=require('path')

//accessing public folder
app.use(express.static(path.join(__dirname,'public')))


//seting admin and user routes
app.use('/admin',adminRoute)
app.use('/',userRoute)

app.listen(3000,()=>{
    console.log('server started')
})




