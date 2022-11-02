const { Bot, Composer, InputFile } = require("grammy");
const { getUsersIds } = require("../../db/models/user/functions");
const {
  createNewCourses,
  finishCourses,
  getCoursesInfo,
} = require("../../db/models/course/functions");
const Course = require("../../db/models/course/course");
const { adminMessages } = require("../messages/admin");

const bot = new Bot(process.env.BOT_TOKEN);

const admin = new Composer();

const checkIsAdmin = (ctx) => {
  // console.log(ctx)
  console.log(ctx.update.channel_post.sender_chat);
  let id = ctx?.from?.id || "";

  if (!id) {
    id = ctx.update.channel_post.sender_chat.id;
  }

  if (
    String(id) === process.env.BOT_ADMIN_ID ||
    String(id) === process.env.BOT_SUPPORT_ID
  ) {
    return true;
  }
    

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
  if (checkIsAdmin(ctx)) {
    if (Boolean(ctx.update.channel_post.sender_chat.id))
      bot.api.sendMessage(
        process.env.BOT_ADMIN_ID,
        `ID канала: ${ctx.update.channel_post.sender_chat.id}`
      );
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

admin.command("test", async (ctx) => {
  await getCoursesInfo();

  await bot.api.sendDocument(
    ctx.from.id,
    new InputFile(`src/files/xlsx.xlsx`, `example.xlsx`)
  );
});

module.exports = admin;
