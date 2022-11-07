const User = require("../user/user");
const Course = require("./course");

const finishCourses = async () => {
  await User.updateMany({}, {$set: { choosedCourse: "", paymentStatus: "unpaid" }})
  await Course.updateMany({ isCourseFinished: false }, {$set: { isCourseFinished: true }});
};

const closeRecruitment = async () => {
  await Course.updateMany({ isRecruitmentOpened: true, isCourseFinished: false }, {$set: { isRecruitmentOpened: false }});
};

const startRecruitment = async () => {
  await Course.updateMany({ isRecruitmentOpened: false, isCourseFinished: false }, {$set: { isRecruitmentOpened: true }});
};

const createNewCourses = async (isFinish = true) => {
  if (isFinish) await finishCourses();

  const newCourses = [
    { name: "Course A1", shortName: "a1" },
    { name: "Course A2", shortName: "a2" },
    { name: "Course B1", shortName: "b1" },
  ];

  await newCourses.forEach(async ({ name, shortName }) => {
    const newCourse = new Course({
      name,
      shortName,
    });

    await newCourse.save();
  });

  return true;
};

const initCreateCourses = async () => {
const courses = await Course.find({});

  if (Boolean(courses.length)) return;

  console.log("init courses docs")
  createNewCourses();
}

const payCourse = async (userId) => {
  const { choosedCourse = "" } = await User.findOne({ userId });
  await Course.findOneAndUpdate(
    { shortName: choosedCourse, isRecruitmentOpened: true },
    {
      $pull: { participantsFirstQueue: userId },
      $push: { participants: userId },
    }
  );
};

module.exports = {
  createNewCourses,
  finishCourses,
  payCourse,
  initCreateCourses,
  closeRecruitment,
  startRecruitment
};
