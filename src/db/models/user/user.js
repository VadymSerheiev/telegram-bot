const mongoose = require("mongoose");

const User = mongoose.model("User", {
  userId: {
    type: Number,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  userName: {
    type: String,
  },
  fullName: {
    type: String,
    default: "",
  },
  paymentStatus: {
    type: String, // unpaid, pending, paid
    default: "unpaid",
  },
  registrationTimestamp: {
    type: Number,
  },
  choosedCourse: {
    type: String,
    default: "",
  },
  questionary: {
    type: String,
    default: "",
  },
});

module.exports = User;
