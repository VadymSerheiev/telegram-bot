const mongoose = require("mongoose");

const Course = mongoose.model("Course", {
  name: {
    type: String,
  },
  shortName: {
    type: String,
  },
  participants: {
    // add validation to check max participants ?
    type: [
      {
        userId: String,
        firstName: String,
        lastName: String,
        userName: String,
        fullName: String,
        timestamp: Number,
      },
    ],
    default: [],
  },
  participantsFirstQueue: {
    type: [
      {
        userId: String,
        firstName: String,
        lastName: String,
        userName: String,
        timestamp: Number,
      },
    ],
    default: [],
  },
  maxParticipants: {
    // add validation to check max participants to be recruitmentClosed after ?
    type: Number,
    default: 50,
  },
  isRecruitmentOpened: {
    type: Boolean,
    default: true,
  },
  isCourseFinished: {
    type: Boolean,
    default: false,
  },
});

module.exports = Course;
