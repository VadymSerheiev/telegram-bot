const adminCommands = [
  "/admin - Вызвать админ панель",
  "/channelId - получить id канала (писать в канале)",
  "/usersIds - получить id пользователей",
  "/createCourses - Создать новые курсы",
  "/showCourses - Посмотреть курсы",
  "/closeCourses - Закрыть набор на курсы❌",
].join("\n\n");

module.exports = {
  adminMessages: {
    adminCommands,
  },
};
