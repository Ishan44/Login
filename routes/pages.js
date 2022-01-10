const express = require("express")
const authController = require("../controllers/auth")

const router = express.Router()

router.get('/', authController.isLoggedIn, (req,res)=>{

    res.render("index.ejs",{
        user: req.user
    })
})


router.get('/register',(req,res)=>{
    res.render("register.ejs")
})

router.get('/login',(req,res)=>{
    res.render("login.ejs")
})

//Check if the user is logged in or not
router.get('/profile', authController.isLoggedIn, (req,res)=>{
    console.log(req.user);
    
    if(req.user){ //if user returned from auth.js do this
        res.render("profile.ejs", {
            user: req.user

        })
    }else{
        res.redirect("/login") //if user is not returned ie the user tried to access the login page using direct bar, redirect to login page
    }
    
})
module.exports = router

