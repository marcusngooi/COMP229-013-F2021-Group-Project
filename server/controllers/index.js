/*  COMP229-013 F2021
    Group Project Part 2 Final Release - Smart Survey
    File Name:   server/controllers/index.js
    Student#:    301147411, 301182173, 301163120, 301168420, 301182196, 301159644 
    Name:        Marcus Ngooi, Tatsiana Ptushko, Josef Signo, Sukhmannat Singh, Yuko Yamano, Agustin Ignacio Zuluaga
    Description: Contains logic for landing page and login     
 */

// require modules
let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let passport = require("passport");

// create the Model instances
let userModel = require("../models/user");
let User = userModel.User; // alias
let Survey = require("../models/survey");

// logic
module.exports.displayHomePage = (req, res, next) => {
  Survey.find((err, surveyList) => {
    if (err) {
      return console.error(err);
    } else {
      res.render("home", {
        title: "Home",
        SurveyList: surveyList,
        displayName: req.user ? req.user.displayName : "",
      });
    }
  });
};

module.exports.displayProfilePage = (req, res, next) => {
  let id = req.user.id;

  User.findById(id, (err, profileToEdit) => {
      if (err) 
      {
          console.log(err);
          res.end(err);
      } 
      else 
      {
          //show the update view
          res.render('auth/profile',
          {title: 'Profile', profile: profileToEdit,
          displayName: req.user ? req.user.displayName : "",})     
      }
  });
} 

module.exports.displayEditProfilePage = (req, res, next) => {
  let id = req.user.id;

  User.findById(id, (err, profileToEdit) => {
      if (err) 
      {
          console.log(err);
          res.end(err);
      } 
      else 
      {
          //show the update view
          res.render('auth/editProfile',
          {title: 'Profile', profile: profileToEdit,
          displayName: req.user ? req.user.displayName : "",})
      }
  });
} 

module.exports.processEditProfilePage = (req, res, next) => {
  let id = req.params.id

    let updatedProfile = User({
        "_id": id,
        "username": req.body.username,
        "email": req.body.email,
        "displayName": req.body.displayName
    });

    User.updateOne({_id: id}, updatedProfile, (err) => {
        if (err) 
        {
            console.log(err);
            res.end(err);
        } 
        else 
        {
            //res.redirect('/');
            return passport.authenticate("local")(req, res, () => {
              res.redirect("/");
            });
        }
    });
}

module.exports.displayLoginPage = (req, res, next) => {
  // check if the user is already logged in
  if (!req.user) {
    res.render("auth/login", {
      title: "Login",
      messages: req.flash("loginMessage"),
      displayName: req.user ? req.user.displayName : "",
    });
  } else {
    return res.redirect("/");
  }
};

module.exports.processLoginPage = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    // server error?
    if (err) {
      return next(err);
    }
    // is there a user login error?
    if (!user) {
      req.flash("loginMessage", "Authentication Error");
      return res.redirect("/login");
    }
    req.login(user, (err) => {
      // server error?
      if (err) {
        return next(err);
      }
      return res.redirect("/surveys");
    });
  })(req, res, next);
};

module.exports.displayRegisterPage = (req, res, next) => {
  // check if the user is not already logged in
  if (!req.user) {
    res.render("auth/register", {
      title: "Register",
      messages: req.flash("registerMessage"),
      displayName: req.user ? req.user.displayName : "",
    });
  } else {
    return res.redirect("/");
  }
};

module.exports.processRegisterPage = (req, res, next) => {
  // instantiate a user object
  let newUser = new User({
    username: req.body.username,
    //password: req.body.password
    email: req.body.email,
    displayName: req.body.displayName,
  });

  User.register(newUser, req.body.password, (err) => {
    if (err) {
      console.log("Error: Inserting New User");
      if (err.name == "UserExistsError") {
        req.flash(
          "registerMessage",
          "Registration Error: User Already Exists!"
        );
        console.log("Error: User Already Exists!");
      }
      return res.render("auth/register", {
        title: "Register",
        messages: req.flash("registerMessage"),
        displayName: req.user ? req.user.displayName : "",
      });
    } else {
      // if no error exists, then registration is successful

      // redirect the user and authenticate them

      return passport.authenticate("local")(req, res, () => {
        res.redirect("/surveys");
      });
    }
  });
};

module.exports.performLogout = (req, res, next) => {
  req.logout();
  res.redirect("/");
};
