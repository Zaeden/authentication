// Package Importing
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// ------------------------------------------------------
// Database Code

// Connecting to mongodb database
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser:true})
.then(function() {
    console.log("Database Connected...!!!");
})
.catch(function(err) {
    console.error(err);
});

//Creating the Schema.
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

//Creating the model.
const User = mongoose.model("User", userSchema);







// ----------------------------------------------------------
// Server Code

const PORT = process.env.PORT || 3000;

//Creating an instance of express app
const app = express();
//Using the public folder
app.use(express.static(__dirname + "/public"));

//Setting ejs as template engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

//Using the body parser middleware.
app.use(bodyParser.urlencoded({extended:true}));








//Controller for "/" Route.
app.get("/", function(req, res) {
    res.render("home");
});


// ---------------------------------------------------------

//Controller for "/register" route.
app.route("/register")

.get(function(req, res) {
    res.render("register");
})

.post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds)
    .then(function(hash) {
        const user = new User({username: username, password: hash});
        user.save()
        .then(function() {
            res.render("secrets");
            console.log("Data inserted into table.");
        })
        .catch(function(err) {
            console.error(err);
        });
    });

    

});

// ---------------------------------------------------------

//Controller for "/login" route.
app.route("/login")

.get(function(req, res) {
    res.render("login");
})

.post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username})
    .then(function(foundUser) {
        console.log(foundUser.password);
        bcrypt.compare(password, foundUser.password)
        .then(function(result) {
            if(result) {
                res.render("secrets");
            }
            else {
                res.redirect("login");
            }
        })
    })
    .catch(function(err) {
        res.redirect("login");
    });

});





//Listening to the port.
app.listen(PORT, function(err) {
    if(err) {
        console.log(`Sorry we hit ${PORT}`);
    }
    console.log(`Server running at port no: ${PORT}`);
})