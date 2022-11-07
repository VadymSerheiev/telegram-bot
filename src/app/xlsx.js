const XLSX = require("xlsx");
const Course = require("../db/models/course/course");
const Reminder = require("../db/models/reminder/reminder");
const User = require("../db/models/user/user");

const getCoursesInfo = async () => {
  const courses = await Course.find({ isCourseFinished: false });

  const getRowsQueue = (shortName) =>
    courses
      .filter((course) => course.shortName === shortName)[0]
      .participantsFirstQueue.map((user) => {
        return [
          user.userId,
          user.firstName,
          user.lastName,
          user.userName,
          new Date(user.timestamp),
        ];
      });

  const getRowsParticipants = async (shortName) => await Promise.all(
    courses
      .filter((course) => course.shortName === shortName)[0]
      .participants.map(async (user) => {
        const doc = await User.findOne({ userId: user.userId });
        return [
          user.userId,
          user.firstName,
          user.lastName,
          user.userName,
          new Date(user.timestamp),
          doc.fullName,
          doc.questionary,
        ];
      })
  );

  const createWorksheet = (rowsParticipants, rowsQueue, origin) =>
    XLSX.utils.aoa_to_sheet(
      [
        ["Учасники"],
        ["ID", "І'мя", "Прізвище", "Юзернейм", "Дата", "ФІО", "Анкета"],
        ...rowsParticipants, //participants,
        [],
        ["Очікуємо оплату"],
        ["ID", "І'мя", "Прізвище", "Юзернейм", "Дата"],
        ...rowsQueue, //queue
      ],
      { origin: "A1" }
    );

  const rowsA1Queue = getRowsQueue("a1");
  const rowsA2Queue = getRowsQueue("a2");
  const rowsB1Queue = getRowsQueue("b1");

  const rowsA1Participants = await getRowsParticipants("a1");
  const rowsA2Participants = await getRowsParticipants("a2");
  const rowsB1Participants = await getRowsParticipants("b1");

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    createWorksheet(rowsA1Participants, rowsA1Queue),
    "Course A1"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    createWorksheet(rowsA2Participants, rowsA2Queue),
    "Course A2"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    createWorksheet(rowsB1Participants, rowsB1Queue),
    "Course B1"
  );

  XLSX.writeFile(workbook, "src/files/xlsx.xlsx");
};

module.exports = {
  getCoursesInfo,
};
