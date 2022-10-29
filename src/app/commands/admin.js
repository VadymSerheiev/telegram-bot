const { Composer } = require("grammy");
const { getUsersIds } = require("../../db/models/user/functions");
const {
  createNewCourses,
  finishCourses,
  getCoursesInfo,
} = require("../../db/models/course/functions");
const Course = require("../../db/models/course/course");
const { adminMessages } = require("../messages/admin");

const admin = new Composer();

const checkIsAdmin = (ctx, process) => {
  const { id } = ctx.from;

  if (
    String(id) === process.env.BOT_ADMIN_ID ||
    String(id) === process.env.BOT_SUPPORT_ID
  )
    return true;

  return false;
};

// midleware for admin check ?
admin.command("admin", (ctx) => {
  if (checkIsAdmin(ctx, process)) {
    ctx.reply(adminMessages.adminCommands, { parse_mode: "Markdown" });
  }
});

admin.command("myId", (ctx) => {
  if (checkIsAdmin(ctx, process)) {
    if (Boolean(ctx?.from?.id)) ctx.reply(`Твой ID: ${ctx.from.id}`);
  }
});

admin.command("channelId", (ctx) => {
  if (checkIsAdmin(ctx, process)) {
    if (Boolean(ctx?.update?.channel_post?.chat?.id))
      ctx.reply(`ID канала: ${ctx?.update?.channel_post?.chat?.id}`, {
        chat_id: BOT_ADMIN_ID,
      });
  }
});

admin.command("usersIds", async (ctx) => {
  if (checkIsAdmin(ctx, process)) {
    const usersIds = await getUsersIds();
    ctx.reply(usersIds);
  }
});

admin.command("createCourses", async (ctx) => {
  if (checkIsAdmin(ctx, process)) {
    const courses = await Course.find({ isCourseFinished: false });
    if (Boolean(courses.length)) await finishCourses();
    if (await createNewCourses()) ctx.reply("✅ Курсы созданы.");
  }
});

admin.command("showCourses", async (ctx) => {
  if (checkIsAdmin(ctx, process)) {
    const courses = await getCoursesInfo();

    ctx.reply(courses || "Нет курсов");
  }
});

module.exports = admin;
