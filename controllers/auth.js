const mysql = require("mysql")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const {promisify} = require("util")


const express = require('express');
const app=express()

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT, //note my port is started at 3307
    user: process.env.DATABASE_USER, //xampp creates user and password automatically with the following data always
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})


exports.register = (req,res)=>{ //here register is being submitted to authcotroller.register in auth.js
    console.log(req.body); //we get the form body



    const {name, email, password, passwordConfirm } = req.body

    db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => { //async as encrypting passwords may take time
        if(err){
            console.log(err);
        }

        if(results.length > 0){ //if there is already an email with that value on our db
            return res.render("register", {
                message: "Email is already is in use" //this is used to send this message to the register ejs to display the alert
            })
        } else if(password !== passwordConfirm) {
            return res.render("register", {
                message: "Passwords do not match"
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8) //8 rounds of encryption
        console.log(hashedPassword);

        db.query("INSERT INTO users SET ?",{name: name, email: email, password: hashedPassword}, (err, results) => {
            if(err){
                console.log(err)
            }else{
                console.log("results");
                console.log(results);
               return res.render('register',{
                   message: "User registered"
               }) 
            }
        }) //name: name, name from database with name from name in js
    }) //here [email] replaces ?
    
    //res.send("Form submitted")

}


exports.login = async (req,res) => {
    try {
        const {email, password} = req.body

        if(!email || !password ){
            return res.status(400).render("login",{  //render login page
                message: "Please provide an email and password"
            })
        }

        db.query("select * from users where email= ?", [email], async(err, results)=>{
            if(!results|| !(await bcrypt.compare(password, results[0].password))){
                return res.status(401).render("login", {
                    message: "Invalid Email ID or Password"
                })
            }else{
                const id = results[0].id //id from db

                const token = jwt.sign({ id: id}, process.env.JWT_SECRET,{
                    expiresIn: process.env.JWT_EXPIRES_IN //when this token is expiring
                })  //sign with user id from db, jwt secret is the secret password to put tokens in cookie
                

                //now set the cookies to the token

                const cookieOptions = { 
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES *86400*1000 //My cookie is going to expire to a new date convert to milisecond
                    ),
                    httpOnly: true //Allow the cookie to be set only if we're on an http environment
                }

                res.cookie("cookieName", token, cookieOptions)
                res.status(200).redirect("/") //redirect the user to homepage after initializing cookie

                
                
            }
        })

    }catch(err){
        console.log(err);
    }
}


exports.isLoggedIn = async (req, res, next) => {
    // req.message = "Inside Middleware" //create a variable of inside middleware

    //console.log(req.cookies); //req.cookies checks if there is something on the cookies
    console.log("res.cookies 112: ");
    console.log(req.cookies);
    if(req.cookies.cookieName){
        try{
            //1. verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.cookieName  ,process.env.JWT_SECRET) //converts try catch verify to promise, here we're verifyint the cookies from jwt ie cookie name and the jwt secret password to verify the cookies created
            console.log(decoded)

            //2. Check if the user still exist
            db.query("select * from users where id = ?",[decoded.id],(err,result)=>{
                
                if(!result){
                    return next() //go inside and render the page
                }

                req.user = result[0] //create a variable, this is passed into pages.js
                return next()
            })
        }catch(err){
            console.log(err);
            return next()
        }
    }else{
        next() //If no cookie call this function, to make sure that you render the page. Vid 009 5 min.
    }
}


exports.logout = async (req, res) => {
    res.cookie("cookieName","logout",{
        expires: new Date(Date.now()+2*1000), //after we press the logout the cookie will expire in 2 seconds
        httpOnly: true
    }) //Set up a new cookie that will override the previous cookie
    res.status(200).redirect("/") //after expiring the cookie it will redirect the user to homepage
}