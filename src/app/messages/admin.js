const adminCommands = [
  "/admin - Вызвать админ панель",
  "/coursesInfo - Інформація про набір у xlsx файлі",
  "/stopRecruitment - Зупинити набір на курси",
  "/startRecruitment - Відновити набір на курси",
  "/closeCourses - Завершити курси і створити нові",
  "/uploadFiles - Завантажити файли по посиланню",
].join("\n\n");

const adminCommandsArray = ["/admin", "/coursesInfo", "/stopRecruitment", "/startRecruitment", "/closeCourses", "/uploadFiles"]

module.exports = {
  adminMessages: {
    adminCommands,
    adminCommandsArray
  },
};
