const mongoose = require("mongoose");
const { generateDate } = require("../../../app/functions");

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
  courseStartDate: {
    type: String,
    default: generateDate()
  },
  courseEndDate: {
    type: String,
    default: ""
  },
  courseStartTimestamp: {
    type: Number,
    default: Date.now()
  },
  courseEndTimestamp: {
    type: Number,
    default: 0
  }
});

module.exports = Course;
