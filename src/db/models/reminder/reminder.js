const mongoose = require("mongoose");

const Reminder = mongoose.model("Reminder", {
  remindUsers: {
    type: [
      {
        userId: String,
        firstName: String,
        lastName: String,
        userName: String,
        choosedCourse: String,
        timestamp: Number,
      },
    ],
    default: [],
  },
});

module.exports = Reminder;
