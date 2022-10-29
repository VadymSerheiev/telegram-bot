const User = require("../user/user");
const Course = require("./course");

const finishCourses = async () => {
  await Course.updateMany({ isCourseFinished: false }, {$set: { isCourseFinished: true }});
};

const createNewCourses = async (isFinish = true) => {
  if (isFinish) finishCourses();

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

const getCoursesInfo = async () => {
  const courses = await Course.find({ isCourseFinished: false });

  return courses.sort()
    .map(
      (course) =>
        `${course.name}\nУчастники:\n${course.participants.join(
          "\n"
        )}\nОжидаем оплату:\n${course.participantsFirstQueue.join("\n")}\n`
    )
    .join("---------------------------\n");
};

const payCourse = async (userId) => {
  const { choosedCourse = "" } = await User.findOne({ userId });
  await Course.findOneAndUpdate(
    { shortName: choosedCourse, isRecruitmentOpened: true, recruitmentClosed: false },
    {
      $pull: { participantsFirstQueue: userId },
      $push: { participants: userId },
    }
  );
};

module.exports = {
  createNewCourses,
  finishCourses,
  getCoursesInfo,
  payCourse,
  initCreateCourses,
};
