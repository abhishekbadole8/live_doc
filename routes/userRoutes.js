const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

// Route to register a new user
router.post("/register", createUser);

// Route to log in an existing user
router.post("/login", loginUser);

// Route to initiate forgot password process
router.post("/forgot-password", forgotPassword);

// Route to reset password
router.post("/reset-password/:token", resetPassword);

module.exports = router;
