const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      Required: true,
      trim: true,
      minlength: 3,
      maxlenght: 50,
    },
    email: {
      type: String,
      unique: true,
      Required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      Required: true,
      minlength: 6,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
