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
const { generateDate, getCallbackChatAndMessageId } = require("../functions");
const { adminKeyboards } = require("../keyboards/admin")

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
  ctx.reply(
    'Ви дійсно хочете закрити всі курси і розпочати нові?',
    {
      reply_markup: adminKeyboards.sureCloseCourses,
      parse_mode: "Markdown",
    }
  );
});

admin.callbackQuery('sureCloseCourses', async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation
  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);
  await createNewCourses();
  await ctx.editMessageText(
    "✅ Курси закрито і створено нові.",
    {
      chat_id,
      message_id,
    }
  );
});

admin.callbackQuery('notSureCloseCourses', async (ctx) => {
  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);
  await ctx.editMessageText(
    '🚫 Операцію відмінено.',
    {
      chat_id,
      message_id,
    }
  );
});

admin.command("coursesInfo", async (ctx) => {
  await getCoursesInfo();

  await bot.api.sendDocument(
    ctx.from.id,
    new InputFile(`src/files/xlsx.xlsx`, `courses-${generateDate()}.xlsx`)
  );
});

admin.command("uploadFiles", async (ctx) => {
  ctx.reply(
    'Необхідно надіслати коментарем id файлу у google drive, попередньо відкривши доступ до нього за посиланням.\n\nОберіть файл для заміни:',
    {
      reply_markup: adminKeyboards.filesUpload,
      parse_mode: "Markdown",
    }
  );
});

admin.callbackQuery('backFilesUpload', async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation
  
  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  await ctx.editMessageText(
    'Необхідно надіслати коментарем id файлу у google drive, попередньо відкривши доступ до нього за посиланням.\n\nОберіть файл для заміни:',
    {
      chat_id,
      message_id,
      reply_markup: adminKeyboards.filesUpload,
      parse_mode: "Markdown",
    }
  );
});

admin.callbackQuery(/upload/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation
  
  const file = ctx.callbackQuery.data.substring(6);
  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  await ctx.editMessageText(
    file,
    {
      chat_id,
      message_id,
      reply_markup: adminKeyboards.backFilesUpload,
      parse_mode: "Markdown",
    }
  );
});

// hidden commands

admin.command("channelId", (ctx) => {
  if (Boolean(ctx?.update?.channel_post?.sender_chat?.id))
    bot.api.sendMessage(
      process.env.BOT_ADMIN_ID,
      `ID канала ${ctx.update.channel_post.sender_chat.title}: ${ctx.update.channel_post.sender_chat.id}`
    );
});

// admin.command("test", async (ctx) => {
//   ctx.reply(generateDate());
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
