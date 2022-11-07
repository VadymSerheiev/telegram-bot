require("dotenv").config();
const { Bot, InputFile } = require("grammy");
const express = require("express");
const admin = require("./app/commands/admin");
const user = require("./app/commands/user");
const { CONSTANTS } = require("./app/constans/user");
const User = require("./db/models/user/user");
const { initCreateCourses } = require("./db/models/course/functions");
const { userKeyboards } = require("./app/keyboards/user");
const {
  moveUserFromQueryToParticipants, checkIsAdmin,
} = require("./db/models/user/functions");
const { initCreateReminder } = require("./db/models/reminder/functions");
const { update } = require("./db/models/user/user");
const { adminMessages } = require("./app/messages/admin");
require("./app/heroku");

const app = express();
require("./db/mongoose");
require("./app/reminder");
require("./app/replicator");
const { BOT_TOKEN, BOT_ADMIN_ID } = process.env;
const bot = new Bot(BOT_TOKEN);

initCreateCourses();
initCreateReminder();

const middlewareFn = async(ctx,next) => {
  console.log(ctx?.update)
  if (ctx?.chat?.type === "channel" && "/channelId" === ctx?.update?.channel_post?.text) {
    return await next();
  }

  // check if chat is private
  if (ctx?.chat?.type === "private" && adminMessages.adminCommandsArray.some((command) => command === ctx?.update?.message?.text) && checkIsAdmin(ctx)) {
    return await next();
  }

  if (ctx?.chat?.type === "private" && !adminMessages.adminCommandsArray.some((command) => command === ctx?.update?.message?.text)) {
    return await next();
  }
}

bot.use(middlewareFn)
bot.use(admin);
bot.use(user);

if (process.env.APP_STATUS === "production") {
  bot.api.setMyCommands([
    { command: "start", description: "Перезавантажити бот" },
    { command: "tariffs", description: "Тарифні плани" },
    { command: "payment", description: "Передплата" }, // ?
    { command: "profile", description: "Мій профіль" }, // ?
    { command: "support", description: "Підтримка" },
    { command: "certeficat", description: "Приклад сертифікату" },
    { command: "reviews", description: "Відгуки про нас" },
  ]);
}

bot.callbackQuery(/infoTariff/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation
  const chat_id = ctx.update.callback_query.message.chat.id;
  const tariff = await ctx.callbackQuery.data.substring(10);
  await ctx.deleteMessage();
  await bot.api.sendDocument(
    chat_id,
    new InputFile(
      `src/files/structure${tariff}.pdf`,
      `Структура курсу ${tariff}.pdf`
    ),
    {
      caption: CONSTANTS[`TARIFF_${tariff}_DESCRIPTION`],
      reply_markup: userKeyboards.backTariffPlans,
    }
  );
});

bot.callbackQuery(/paid/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation
  const userId = ctx.callbackQuery.data.substring(4);
  await ctx.deleteMessage();

  // retrun course shortName to find id of channel to invite
  const choosedCourse = await moveUserFromQueryToParticipants(userId);
  
  //24 hours experation time limit
  const { invite_link } = await bot.api.createChatInviteLink(process.env[`CHANNEL_${choosedCourse.toUpperCase()}`], {
    member_limit: 1
  });

  await ctx.api.sendMessage(
    userId,
    `✅ Оплата підтверджена.\nДякуємо Вам за оплату!\n\n[Запрошення до нашого закритого каналу.](${invite_link})`,
    {
      parse_mode: "Markdown",
    }
  );

  await ctx.api.sendMessage(userId, CONSTANTS.QUESTIONARY);
});

// error handler for bot
bot.catch(async (err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e) {
    await ctx.api.sendMessage(
      process.env.BOT_SUPPORT_ID,
      "⚠️ Error. Please check console."
    );
    console.error("Error:", e);
  }
});

bot.start();

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log(`server - is running at port ${PORT}`);
  console.log(`server - current time is ${new Date()}`);
});
