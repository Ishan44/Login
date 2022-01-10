const express = require("express")
const authController = require("../controllers/auth")

const router = express.Router()

router.post('/register',authController.register) //when ever we're gonna load this, we'll be loading authcontroller and 

router.post("/login",authController.login)

router.get("/logout",authController.logout) //get cause when ever we login to a page we need to use get 

module.exports = router

