// Package Importing
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
// const session = require("session");


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

app.use(session({
    secret: "My little secret",
    resave: false,
    saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());














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

//For salting and hashing.
userSchema.plugin(passportLocalMongoose);


//Creating the model.
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






// ----------------------------------------------------------




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
    
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if(err) {
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }

    })
    

});

app.get("/secrets", function(req, res) {
    if(req.isAuthenticated()) {
        res.render("secrets");
    }
    else {
        res.redirect("/login");
    }
});

// ---------------------------------------------------------

//Controller for "/login" route.
app.route("/login")

.get(function(req, res) {
    res.render("login");
})

.post(function(req, res) {
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })

});


//logout route
app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if(err) return next(err);
        res.redirect("/");
    });
    
})


//Listening to the port.
app.listen(PORT, function(err) {
    if(err) {
        console.log(`Sorry we hit ${PORT}`);
    }
    console.log(`Server running at port no: ${PORT}`);
})