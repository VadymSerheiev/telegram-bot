// modules
const { Composer, Bot } = require("grammy");
const { InlineKeyboard, InputFile } = require("grammy");
// constants
const { CONSTANTS } = require("../constans/user");
// functions
const {
  checkAndCreateNewUser,
  setWantToPayTariff,
  checkIsCourseClosed,
  setChoosedCourse,
  getChoosedCourseAndPaymentStatus,
  isRecruitmentOpened,
} = require("../../db/models/user/functions");
const {
  addUserToReminder,
  removeUserFromReminder,
} = require("../../db/models/reminder/functions");
const { createAndUploadFile } = require("../replicator");
const { getCallbackChatAndMessageId } = require("../functions");
// keyboards
const { userKeyboards } = require("../keyboards/user");
const { userMessages } = require("../messages/user");
// models
const User = require("../../db/models/user/user");
const { ADMIN_CONSTANTS } = require("../constans/admin");


const bot = new Bot(process.env.BOT_TOKEN);

const user = new Composer();

user.command("start", async (ctx) => {
  await checkAndCreateNewUser(ctx);

  await ctx.reply(CONSTANTS.GREETINGS, {
    reply_markup: userKeyboards.mainMenu,
  });
});

user.command("tariffs", async (ctx) => {
  await ctx.reply(
    `*${CONSTANTS.TARIFF_PLANS}*\n\n${CONSTANTS.TARIFFS_DESCRIPTION}`,
    {
      reply_markup: userKeyboards.tariffPlans,
      parse_mode: "Markdown",
    }
  );
});

user.callbackQuery("backTariffPlans", async (ctx) => {
  await ctx.answerCallbackQuery(); // removes loading animation
  await ctx.deleteMessage();
  await ctx.reply(
    `*${CONSTANTS.TARIFF_PLANS}*\n\n${CONSTANTS.TARIFFS_DESCRIPTION}`,
    {
      reply_markup: userKeyboards.tariffPlans,
      parse_mode: "Markdown",
    }
  );
});

user.command("profile", async (ctx) => {
  const me = await User.findOne({ userId: ctx.from.id });

  const getPaymentStatus = (status) => {
    switch (status) {
      case "unpaid":
        return CONSTANTS.UNPAID;
      case "pending":
        return CONSTANTS.PENDING;
      case "paid":
        return CONSTANTS.PAID;
    }
  };

  const ID = `*ID*: \`${me.userId}\``;
  const userName = me.userName.length
    ? `\n*${CONSTANTS.USER_NAME}*: \`${me.userName}\``
    : "";
  const firstName = me.firstName.length
    ? `\n*${CONSTANTS.FIRST_NAME}*: \`${me.firstName}\``
    : "";
  const lastName = me.lastName.length
    ? `\n*${CONSTANTS.LAST_NAME}*: \`${me.lastName}\``
    : "";
  const fullName = me.fullName.length
    ? `\n*${CONSTANTS.FULL_NAME}*: \`${me.fullName}\``
    : "";
  const course = me.choosedCourse.length
    ? `\n*${CONSTANTS.CHOOSED_COURSE}*: \`${me.choosedCourse.toUpperCase()}\``
    : `\n*${CONSTANTS.CHOOSED_COURSE}*: \`${CONSTANTS.NOT_CHOOSED_COURSE}\``;
  const questionary = me.questionary.length
    ? `\n*${CONSTANTS.QUESTIONARY}*: \`${me.questionary}\``
    : "";
  const paymentStatus = me.choosedCourse.length
    ? `\n*${CONSTANTS.PAYMENT_STATUS}*: \`${getPaymentStatus(
        me.paymentStatus
      )}\``
    : "";

  ctx.reply(
    `${ID}${userName}${firstName}${lastName}${fullName}${course}${paymentStatus}${questionary}`,
    {
      parse_mode: "Markdown",
    }
  );
});

user.command("payment", async (ctx) => {
  const isOpened = await isRecruitmentOpened();
  if (!isOpened) {
    return await ctx.reply(CONSTANTS.SORRY_RECRUITMENT_CLOSED);
  }

  await ctx.reply(
    `*${CONSTANTS.PAYMENT}\n\n*${CONSTANTS.PAYMENT_DESCRIPTION}`,
    {
      reply_markup: userKeyboards.tariffsMenu,
      parse_mode: "Markdown",
    }
  );
});

// get rid of lower case
user.callbackQuery(/chooseTariff/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const tariff = ctx.callbackQuery.data.substring(12);
  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  const isClosed = await checkIsCourseClosed(ctx, tariff.toLowerCase());
  if (isClosed) return;

  await ctx.editMessageText(
    `${CONSTANTS.PAYMENT} ➡️ *${CONSTANTS[`TARIFF_${tariff}`]}*`,
    {
      chat_id,
      message_id,
      reply_markup: userKeyboards[`singleTariff${tariff}Menu`],
      parse_mode: "Markdown",
    }
  );
});

user.callbackQuery(/returnTariff/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const tariff = ctx.callbackQuery.data.substring(12);
  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  await ctx.editMessageText(
    `${CONSTANTS.PAYMENT} ➡️ *${CONSTANTS[`TARIFF_${tariff}`]}*`,
    {
      chat_id,
      message_id,
      reply_markup: userKeyboards[`singleTariff${tariff}Menu`],
      parse_mode: "Markdown",
    }
  );
});

user.callbackQuery(/payNow/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const tariff = ctx.callbackQuery.data.substring(6);
  const { userId, chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  await setChoosedCourse(userId, tariff.toLowerCase());

  const isSucess = await setWantToPayTariff(ctx);

  if (!isSucess) {
    return;
  }

  await ctx.editMessageText(userMessages[`requisitesMessage${tariff}`], {
    chat_id,
    message_id,
    reply_markup: userKeyboards[`requisites${tariff}Menu`],
    parse_mode: "HTML",
  });
});

user.callbackQuery(/remind[A-Z][1-9]/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const tariff = ctx.callbackQuery.data.substring(6);
  const { chat_id } = getCallbackChatAndMessageId(ctx);

  await addUserToReminder(chat_id, tariff);
  // message that succesfully added to reminder? send message or owerite?

  await ctx.reply(CONSTANTS.WE_WILL_REMIND_YOU);
});

user.callbackQuery("notRemind", async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const { chat_id } = getCallbackChatAndMessageId(ctx);

  await removeUserFromReminder(chat_id);
  // message that succesfully added to reminder? send message or owerite?

  await ctx.reply(CONSTANTS.NEVER_REMIND);
});

user.callbackQuery("backTariffs", async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  await ctx.editMessageText(
    `*${CONSTANTS.PAYMENT}\n\n*${CONSTANTS.PAYMENT_DESCRIPTION}`,
    {
      chat_id,
      message_id,
      reply_markup: userKeyboards.tariffsMenu,
      parse_mode: "Markdown",
    }
  );
});

// receives only photo with caption
// only private chat
user.on(":photo", async (ctx) => {
  const { choosedCourse, paymentStatus } =
    await getChoosedCourseAndPaymentStatus(ctx);
  const isChoosedCourse = Boolean(choosedCourse.length);

  if (!isChoosedCourse) {
    await ctx.reply(CONSTANTS.NOT_CHOOSED_COURSE_MESSAGE, {
      parse_mode: "Markdown",
    });
    return;
  }

  if (paymentStatus === "paid") {
    await ctx.reply(ALREADY_PARTICIPANT, {
      parse_mode: "Markdown",
    });
    return;
  }

  const caption = ctx?.update?.message?.caption;

  if (!Boolean(caption)) {
    await ctx.reply(CONSTANTS.NO_PHOTO_CAPTION);
    return;
  }

  const approvePay = new InlineKeyboard()
    .text(ADMIN_CONSTANTS.APPLY_PAYMENT, `paid${ctx.from.id}`)
    .text(ADMIN_CONSTANTS.DENIE_PAYMENT, `denied${ctx.from.id}`)
    .row();

  await ctx.api.sendPhoto(
    process.env.BOT_ADMIN_ID,
    ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
    {
      caption: `${ADMIN_CONSTANTS.SENDER}: ${caption}`,
      reply_markup: approvePay,
    }
  );

  await User.findOneAndUpdate(
    { userId: ctx.from.id },
    { $set: { paymentStatus: "pending" } }
  );

  await createAndUploadFile({
    sender: caption,
    userId: ctx.from.id,
    fileId:
      ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
    data: null,
    type: "check",
    folder: "checks",
  });

  const now = new Date();
  if (now.getUTCHours() <= 6 || now.getUTCHours() >= 18) {
    await ctx.reply(CONSTANTS.WORK_GRAPHIC);
  }

  await ctx.reply(CONSTANTS.RECIEVED_CHECK);
});

user.command("certificate", async (ctx) => {
  const chat_id = ctx.update.message.chat.id;

  await bot.api.sendDocument(
    chat_id,
    new InputFile(
      "src/files/certificate.pdf",
      `${CONSTANTS.CERTIFICATE_FILE_NAME}.pdf`
    ),
    {
      caption: CONSTANTS.CERTIFICATE_DESCRIPTION,
    }
  );
});

user.command(
  "reviews",
  (ctx) =>
    ctx.reply(CONSTANTS.REVIEWS_DESCRIPTION, {
      reply_markup: userKeyboards.reviewsButton,
      parse_mode: "Markdown",
    })
  // maybe send message with some description?
);

user.command(
  "support",
  // send contact or just link?
  async (ctx) => {
    const now = new Date();
    if (now.getUTCHours() <= 6 || now.getUTCHours() >= 18) {
      await ctx.reply(CONSTANTS.WORK_GRAPHIC);
    }

    await ctx.replyWithContact(
      CONSTANTS.SUPPROT_CONTACT_NUMBER,
      CONSTANTS.SUPPROT_CONTACT_NAME
    );
    await ctx.reply(CONSTANTS.SUPPORT_DESCRIPTION);
  }
  // ctx.reply("[Связь с нашим менеджером](tg://user?id=306726408)", {
  //   parse_mode: 'Markdown'
  // })
);

module.exports = user;
