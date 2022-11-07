const { Bot, Composer, InputFile } = require("grammy");
const { getUsersIds } = require("../../db/models/user/functions");
const {
  createNewCourses,
  finishCourses,
  closeRecruitment,
  startRecruitment,
} = require("../../db/models/course/functions");
const Course = require("../../db/models/course/course");
const { adminMessages } = require("../messages/admin");
const { getCoursesInfo } = require("../xlsx");
const { getAllCollections, createAndUploadFile } = require("../replicator");

const bot = new Bot(process.env.BOT_TOKEN);

const admin = new Composer();

// midleware for admin check ?
admin.command("admin", (ctx) => {
  ctx.reply(adminMessages.adminCommands, { parse_mode: "Markdown" });
});

admin.command("stopRecruitment", async (ctx) => {
  await closeRecruitment();

  await ctx.reply("Набір на курси завершено.", { parse_mode: "Markdown" });
});

admin.command("startRecruitment", async (ctx) => {
  await startRecruitment();

  await ctx.reply("Набір на курси відновлено.", { parse_mode: "Markdown" });
});

admin.command("closeCourses", async (ctx) => {
  await createNewCourses();

  await ctx.reply("Курси завершено і створено нові.", { parse_mode: "Markdown" });
});

admin.command("coursesInfo", async (ctx) => {
  await getCoursesInfo();

  await bot.api.sendDocument(
    ctx.from.id,
    new InputFile(`src/files/xlsx.xlsx`, `example-${Date.now()}.xlsx`)
  );
});

// admin.command("test", async (ctx) => {
  
// });

// admin.command("channelId", (ctx) => {
//   if (Boolean(ctx.update.channel_post.sender_chat.id))
//     bot.api.sendMessage(
//       process.env.BOT_ADMIN_ID,
//       `ID канала: ${ctx.update.channel_post.sender_chat.id}`
//     );
// });

// admin.command("usersIds", async (ctx) => {
//   const usersIds = await getUsersIds();
//   ctx.reply(usersIds);
// });

// admin.command("createCourses", async (ctx) => {
//   const courses = await Course.find({ isCourseFinished: false });
//   if (Boolean(courses.length)) await finishCourses();
//   if (await createNewCourses()) ctx.reply("✅ Курсы созданы.");
// });

// admin.command("showCourses", async (ctx) => {
//   const courses = await getCoursesInfo();

//   ctx.reply(courses || "Нет курсов");
// });

module.exports = admin;
