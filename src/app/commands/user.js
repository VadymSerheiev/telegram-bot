const { Composer, Bot } = require("grammy");
const { InlineKeyboard, InputFile } = require("grammy");
const { CONSTANTS } = require("../constans/user");
const {
  checkAndCreateNewUser,
  setWantToPayTariff,
  checkIsCourseClosed,
  setChoosedCourse,
  getChoosedCourse,
  getChoosedCourseAndPaymentStatus,
  isRecruitmentOpened,
} = require("../../db/models/user/functions");
const { userKeyboards } = require("../keyboards/user");
const { userMessages } = require("../messages/user");
const User = require("../../db/models/user/user");
const {
  getParticipantsFirstQueue,
} = require("../../db/models/course/functions");
const {
  addUserToReminder,
  removeUserFromReminder,
} = require("../../db/models/reminder/functions");
const { getCoursesInfo, getAllCollections } = require("../xlsx");
const { createAndUploadFile } = require("../replicator");
const { getCallbackChatAndMessageId } = require("../functions");

const bot = new Bot(process.env.BOT_TOKEN);

const user = new Composer();

// add відгуки and приклад сертифікату
user.command("start", async (ctx) => {
  await checkAndCreateNewUser(ctx);

  await ctx.reply(CONSTANTS.GREETINGS, {
    reply_markup: userKeyboards.mainMenu,
  });
});

user.command("tariffs", async (ctx) => {
  await ctx.reply(
    `*${CONSTANTS.TARIFF_PLANS}*\n\nЗагальна інформація про тарифні плани з прикладом структури курсів.`,
    {
      reply_markup: userKeyboards.tariffPlans,
      parse_mode: "Markdown",
    }
  );
});

user.callbackQuery("backTariffPlans", async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation
  await ctx.deleteMessage();
  await ctx.reply(
    `*${CONSTANTS.TARIFF_PLANS}*\n\nЗагальна інформація про тарифні плани з прикладом структури курсів.`,
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
        return "⛔️ Не сплачено";
      case "pending":
        return "⏳ Перевіряється";
      case "paid":
        return "✅Сплачено";
    }
  };

  const ID = me.userId;
  const userName = me.userName.length
    ? `\n*User name*: \`${me.userName}\``
    : "";
  const firstName = me.firstName.length
    ? `\n*First name*: \`${me.firstName}\``
    : "";
  const lastName = me.lastName.length
    ? `\n*Last name*: \`${me.lastName}\``
    : "";
  const fullName = me.fullName.length
    ? `\n*Ім'я та прізвище*: \`${me.fullName}\``
    : "";
  const questionary = me.questionary.length
    ? `\n*Про мене*: \`${me.questionary}\``
    : "";
  const paymentStatus = getPaymentStatus(me.paymentStatus);

  ctx.reply(
    `*ID*: \`${ID}\`${userName}${firstName}${lastName}${fullName}\n*Обраний курс*: \`${me.choosedCourse.toUpperCase()}\`\n*Статус платежу*: \`${paymentStatus}\`${questionary}`,
    {
      parse_mode: "Markdown",
    }
  );
});

user.command("payment", async (ctx) => {
  const isOpened = await isRecruitmentOpened();
  if (!isOpened) {
    return await ctx.reply("Вибачте, в даний момент набір на курси зачинено.");
  }

  await ctx.reply(
    `*${CONSTANTS.MY_PAYMENT}\n\n*Оберіть, будь ласка, тариф за яким Ви бажаєте здійснити передплату.`,
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
    `${CONSTANTS.MY_PAYMENT} ➡️ *${CONSTANTS[`TARIFF_${tariff}`]}*`,
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
    `${CONSTANTS.MY_PAYMENT} ➡️ *${CONSTANTS[`TARIFF_${tariff}`]}*`,
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

  await ctx.reply("✅ Ми Вам нагадаємо про сплату.");
});

user.callbackQuery("notRemind", async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const { chat_id } = getCallbackChatAndMessageId(ctx);

  await removeUserFromReminder(chat_id);
  // message that succesfully added to reminder? send message or owerite?

  await ctx.reply("Ми більше не будемо Вам нагадувати про сплату 😉");
});

user.callbackQuery("backTariffs", async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  await ctx.editMessageText(
    `*${CONSTANTS.MY_PAYMENT}\n\n*Оберіть, будь ласка, тариф за яким Ви бажаєте здійснити передплату.`,
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
  const {choosedCourse, paymentStatus} = await getChoosedCourseAndPaymentStatus(ctx);
  const isChoosedCourse = Boolean(choosedCourse.length);

  if (!isChoosedCourse) {
    await ctx.reply(
      `Вибачте, Ви ще не обрали курс. Для того щоб обрати курс перейдіть будь ласка до пункту \"*${CONSTANTS.MY_PAYMENT}*\" і оберіть будь ласка курс.`,
      {
        parse_mode: "Markdown",
      }
    );
    return;
  }

  if (paymentStatus === "paid") {
    await ctx.reply(
      `Ви вже є учасником одного з курсів.`,
      {
        parse_mode: "Markdown",
      }
    );
    return;
  }

  const caption = ctx?.update?.message?.caption;

  if (!Boolean(caption)) {
    await ctx.reply(CONSTANTS.NO_PHOTO_CAPTION);
    return;
  }

  const approvePay = new InlineKeyboard()
    .text("✅ Підтвердити оплату", `paid${ctx.from.id}`)
    .text("🚫 Скасувати оплату", `denied${ctx.from.id}`)
    .row();

  await ctx.api.sendPhoto(
    process.env.BOT_ADMIN_ID,
    ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
    {
      caption: `Відправник: ${caption}`,
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
    fileId: ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,
    data: null,
    type:'check',
    folder: 'checks'
  });

  const now = new Date();
  if ((now.getUTCHours() <= 6) || (now.getUTCHours() >= 18)) {
    await ctx.reply("Вибачте, наш робочий день завершився. Ми постараємося відповісти Вам якомога швидше.")
  }

  await ctx.reply("Наш менеджер отримав фото чеку. Після підтвердження платежу ви отримаєте повідомлення.");
});

user.command("certificate", async (ctx) => {
  const chat_id = ctx.update.message.chat.id;

  await bot.api.sendDocument(
    chat_id,
    new InputFile("src/files/certificate.pdf", "Приклад сертифікату.pdf"),
    {
      caption: "Приклад сертифікату, який Ви отримаєте по завершенню курсу.",
    }
  );
});

user.command(
  "reviews",
  (ctx) =>
    ctx.reply(
      `За цим посиланням Ви можете ознайомитись з відгуками про нас.`,
      {
        reply_markup: userKeyboards.reviewsButton,
        parse_mode: "Markdown",
      }
    )
  // maybe send message with some description?
);

user.command(
  "support",
  // send contact or just link?
  async (ctx) => {
    const now = new Date();
    if ((now.getUTCHours() <= 6) || (now.getUTCHours() >= 18)) {
      await ctx.reply("Вибачте, наш робочий день завершився. Ми постараємося відповісти Вам якомога швидше.")
    }

    await ctx.replyWithContact("+380505736797", "Vadym");
    await ctx.reply(
      "Якщо у Вас виникнуть будь-які питання, Ви можете звернутись до нашого менеджера."
    );
  }
  // ctx.reply("[Связь с нашим менеджером](tg://user?id=306726408)", {
  //   parse_mode: 'Markdown'
  // })
);

module.exports = user;
