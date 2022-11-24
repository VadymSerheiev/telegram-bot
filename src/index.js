// imports env constants
require("dotenv").config();
// modules
const { Bot, InputFile } = require("grammy");
const express = require("express");
// commands
const admin = require("./app/commands/admin");
const user = require("./app/commands/user");
const messages = require("./app/commands/messages");
// constants
const { CONSTANTS } = require("./app/constans/user");
// functions
const { initCreateCourses } = require("./db/models/course/functions");
const {
  moveUserFromQueryToParticipants, checkIsAdmin,
} = require("./db/models/user/functions");
const { initCreateReminder } = require("./db/models/reminder/functions");
// keyboards
const { userKeyboards } = require("./app/keyboards/user");
// admin commands array to validate admin in middleware
const { adminMessages } = require("./app/messages/admin");

const app = express();
require("./db/mongoose");
require("./app/reminder");
require("./app/replicator");
const bot = new Bot(process.env.BOT_TOKEN);

initCreateCourses();
initCreateReminder();

const middlewareFn = async(ctx,next) => {
  // console.log(ctx?.update)
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
bot.use(messages);

if (process.env.APP_STATUS === "production") {
  bot.api.setMyCommands(CONSTANTS.USER_COMMANDS);
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
  const {choosedCourse, fullName, questionary} = await moveUserFromQueryToParticipants(userId);
  
  const { invite_link } = await bot.api.createChatInviteLink(process.env[`CHANNEL_${choosedCourse.toUpperCase()}`], {
    member_limit: 1
  });

  await ctx.api.sendMessage(
    userId,
    `${CONSTANTS.PAYMENT_SUCCESS}\n\n[${CONSTANTS.INVITE_LINK}](${invite_link})`,
    {
      parse_mode: "Markdown",
    }
  );

  // ask full name
  if (!Boolean(fullName.length) && !Boolean(questionary.length)) {
    await ctx.api.sendMessage(userId, CONSTANTS.FULL_NAME);
  }
});

bot.callbackQuery(/denied/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation
  const userId = ctx.callbackQuery.data.substring(6);
  await ctx.deleteMessage();

  await ctx.api.sendMessage(
    userId,
    CONSTANTS.PAYMENT_FAIL,
    {
      parse_mode: "Markdown",
    }
  );
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
