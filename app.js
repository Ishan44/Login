const express = require("express")
const path = require("path") //path is present by default
const mysql = require("mysql")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")

dotenv.config({path: './.env'}) //tell .env where is the file that we want

const app = express()
app.set("view engine", "ejs")

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT, //note my port is started at 3307
    user: process.env.DATABASE_USER, //xampp creates user and password automatically with the following data always
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

//parsing url-encoded bodies as sent by html forms, to grab the data from any forms
app.use(express.urlencoded({extended: false}))
// the values that were grabbing as forms comes as json
app.use(express.json())
app.use(cookieParser()) //use this to set up the cookie to the browser

const publicDirectory = path.join(__dirname,"./public") //public directory is just where we want to keep css and stuffs, anything that starts with / goes to public directory 
app.use(express.static(publicDirectory)) //to tell express to use all the public directory and stuffs




db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("My Sql connected");
    }
})

 
//Define Routes
app.use("/",require("./routes/pages.js"))
app.use("/auth",require("./routes/auth")) //what ever starts with /auth, we go requiring the routes of auth.js 





app.listen(5000, ()=>{
    console.log("Server started on Port 5000");
})