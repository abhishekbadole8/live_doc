const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

// Function to register a new user
const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Return success response with token
    res.status(201).json({ message: "User created successfully", token });
  } catch (err) {
    next(err);
  }
};

// Function to log in an existing user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return success response with token
    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
};

// Function to initiate forgot password process
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token and expiration time
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetTokenExpiration = new Date(new Date().getTime() + 3600000); // 1 hour from now

    // Save reset token and expiration time to user document
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    // Send reset link to user's email
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "247c7deb777fcf",
        pass: "48ed9e2f716c02",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: "Password Reset", // Subject line
      text: `You are receiving this email because you (or someone else) have requested to reset the password for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process:\n\n
        ${process.env.CLIENT_URL}/api/users/reset-password/${resetToken}\n\n
        This link will expire in 1 hour. If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending reset email" });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Reset email sent successfully" });
    });
  } catch (err) {
    next(err);
  }
};

// Function to reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params; // Extract token from URL parameter
    const { newPassword } = req.body;

    // Decode token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is valid and not expired
    if (
      !decodedToken ||
      !decodedToken.userId ||
      !decodedToken.exp ||
      decodedToken.exp * 1000 < new Date().getTime()
    ) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find user by token
    const user = await User.findById(decodedToken.userId);
    if (
      !user ||
      user.resetToken !== token ||
      user.resetTokenExpiration < new Date()
    ) {
      return res
        .status(404)
        .json({ message: "Invalid token or user not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and reset token fields
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, loginUser, forgotPassword, resetPassword };
