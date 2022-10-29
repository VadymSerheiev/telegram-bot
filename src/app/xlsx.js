const XLSX = require("xlsx");
const Course = require("../db/models/course/course");
const User = require("../db/models/user/user");

const getCoursesInfo = async () => {
  const courses = await Course.find({ isCourseFinished: false });

  const rowsA1queue = courses
    .filter((course) => course.shortName === "a1")[0]
    .participantsFirstQueue.map( (user) => {
      return [user.userId, user.firstName, user.lastName, user.userName, new Date(user.timestamp)];
    });

  const rowsA1participants = await Promise.all(courses
    .filter((course) => course.shortName === "a1")[0]
    .participants.map( async (user) => {
      const doc = await User.findOne({userId: user.userId})
      return [user.userId, user.firstName, user.lastName, user.userName, new Date(user.timestamp), doc.fullName, doc.questionary];
    }));
  const rowsA2 = courses.filter((course) => course.shortName === "a2")[0]
    .participantsFirstQueue;
  const rowsB1 = courses.filter((course) => course.shortName === "b1")[0]
    .participantsFirstQueue;

  var worksheet = XLSX.utils.aoa_to_sheet([
    ["Учасники"],
    ["ID", "І'мя", "Прізвище", "Юзернейм", "Дата", "ФІО", "Анкета"],
    ...rowsA1participants, //participants,
    [],
    ["Очікуємо оплату"],
    ["ID", "І'мя", "Прізвище", "Юзернейм", "Дата"],
    ...rowsA1queue, //queue
  ], { origin: "A1" });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Course A1");
  const worksheetA2 = XLSX.utils.json_to_sheet(rowsA2);
  XLSX.utils.book_append_sheet(workbook, worksheetA2, "Course A2");
  const worksheetB1 = XLSX.utils.json_to_sheet(rowsB1);
  XLSX.utils.book_append_sheet(workbook, worksheetB1, "Course B1");

  XLSX.writeFile(workbook, "src/files/xlsx.xlsx");
};

module.exports = {
  getCoursesInfo,
};
