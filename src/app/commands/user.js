const { Composer, Bot } = require("grammy");
const { InlineKeyboard, InputFile } = require("grammy");
const { CONSTANTS } = require("../constans/user");
const {
  checkAndCreateNewUser,
  setWantToPayTariff,
  checkIsCourseClosed,
  setChoosedCourse,
  getChoosedCourse,
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
    ? `\n*Full name*: \`${me.fullName}\``
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
  await ctx.reply(
    `*${CONSTANTS.MY_PAYMENT}\n\n*Оберіть, будь ласка, тариф за яким Ви бажаєте здійснити передплату.`,
    {
      reply_markup: userKeyboards.tariffsMenu,
      parse_mode: "Markdown",
    }
  );
});

const getCallbackChatAndMessageId = (ctx) => {
  const chat_id = ctx.update.callback_query.message.chat.id;
  const message_id = ctx.update.callback_query.message.message_id;
  const userId = ctx.update.callback_query.from.id;

  return { userId, chat_id, message_id };
};

// get rid of lower case
user.callbackQuery(/chooseTariff/, async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const tariff = ctx.callbackQuery.data.substring(12);
  const { userId, chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  const isClosed = await checkIsCourseClosed(ctx, tariff.toLowerCase());
  if (isClosed) return;
  await setChoosedCourse(userId, tariff.toLowerCase());

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
  const { chat_id, message_id } = getCallbackChatAndMessageId(ctx);

  await setWantToPayTariff(ctx);

  await ctx.editMessageText(userMessages[`requisitesMessage${tariff}`], {
    chat_id,
    message_id,
    reply_markup: userKeyboards[`requisites${tariff}Menu`],
    parse_mode: "HTML",
  });
});

user.callbackQuery("remind", async (ctx) => {
  await ctx.answerCallbackQuery(); // remove loading animation

  const { chat_id } = getCallbackChatAndMessageId(ctx);

  await addUserToReminder(chat_id);
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
  const choosedCourse = await getChoosedCourse(ctx);
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

  const caption = ctx?.update?.message?.caption;

  if (!Boolean(caption)) {
    await ctx.reply(CONSTANTS.NO_PHOTO_CAPTION);
    return;
  }

  const approvePay = new InlineKeyboard()
    .text("Підтвердити оплату", `paid${ctx.from.id}`)
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
    { $set: { fullName: caption, paymentStatus: "pending" } }
  );

  await createAndUploadFile(ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id,'check','checks');

  await ctx.reply("Наш менеджер отримав фото чеку. Після підтвердження платежу ви отримаєте повідомлення.");
});

user.command("certeficat", async (ctx) => {
  console.log(ctx);
  const chat_id = ctx.update.message.chat.id;

  await bot.api.sendDocument(
    chat_id,
    new InputFile("src/files/serteficate.pdf", "Приклад сертифікату.pdf"),
    {
      caption: "Приклад сертифікат, який Ви отримаєте по завершенню кусру.",
    }
  );
});

user.command(
  "reviews",
  (ctx) =>
    ctx.reply(
      "[Відгуки про нас](https://www.google.com/)\n\nЗа цим посиланням Ви можете ознайомитись з відгуками про нас.",
      {
        parse_mode: "Markdown",
      }
    )
  // maybe send message with some description?
);

user.command(
  "support",
  // send contact or just link?
  async (ctx) => {
    await ctx.replyWithContact("+380505736797", "Vadym");
    await ctx.reply(
      "Якщо у Вас виникнуть будь-які питання, Ви можете звернутись до нашого менеджера."
    );
  }
  // ctx.reply("[Связь с нашим менеджером](tg://user?id=306726408)", {
  //   parse_mode: 'Markdown'
  // })
);

user.on("message", async (ctx) => {
  if (ctx?.update?.message?.text === CONSTANTS.TARIFF_PLANS) {
    ctx.reply(
      `*${CONSTANTS.TARIFF_PLANS}*\n\nЗагальна інформація про тарифні плани з прикладом структури курсів.`,
      {
        reply_markup: userKeyboards.tariffPlans,
        parse_mode: "Markdown",
      }
    );

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.MY_PAYMENT) {
    ctx.reply(
      `*${CONSTANTS.MY_PAYMENT}\n\n*Оберіть, будь ласка, тариф за яким Ви бажаєте здійснити передплату.`,
      {
        reply_markup: userKeyboards.tariffsMenu,
        parse_mode: "Markdown",
      }
    );

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.MY_PROFILE) {
    const me = await User.findOne({ userId: ctx.from.id });

    const getPaymentStatus = (status) => {
      switch (status) {
        case "unpaid":
          return "⛔️ Не сплачено";
        case "pending":
          return "⏳ Перевіряється";
        case "paid":
          return "✅ Сплачено";
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
      ? `\n*Full name*: \`${me.fullName}\``
      : "";
    const course = me.choosedCourse.length
      ? `\n*Обраний курс*: \`${me.choosedCourse.toUpperCase()}\``
      : "\n*Обраний курс*: `➖ Не обрано`";
    const questionary = me.questionary.length
      ? `\n*Про мене*: \`${me.questionary}\``
      : "";
    const paymentStatus = me.choosedCourse.length
      ? `\n*Статус платежу*: \`${getPaymentStatus(me.paymentStatus)}\``
      : "";

    ctx.reply(
      `*ID*: \`${ID}\`${userName}${firstName}${lastName}${fullName}${course}${paymentStatus}${questionary}`,
      {
        parse_mode: "Markdown",
      }
    );

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.SUPPORT) {
    await ctx.replyWithContact("+380505736797", "Vadym");
    await ctx.reply(
      "Якщо у Вас виникнуть будь-які питання, Ви можете звернутись до нашого менеджера."
    );

    return;
  }

  if (
    ctx?.update?.message?.reply_to_message?.text.includes(CONSTANTS.QUESTIONARY)
  ) {
    const { questionary } = await User.findOne({ userId: ctx.from.id });
    const oldText = !questionary.length ? "" : `${questionary}. `;
    await User.findOneAndUpdate(
      { userId: ctx.from.id },
      { $set: { questionary: `${oldText}${ctx?.update?.message?.text}` } }
    );

    if (!questionary.length) {
      ctx.reply("Приємно познайомитись 😉");
    } else {
      ctx.reply("Чим більше ми про тебе дізнаємось, тим краще 😉");
    }

    return;
  }

  await ctx.reply(
    "Вибачте, я не розумію цієї команди 🤷‍♂️ Можливо Ви хотіли відповісти на якесь моє повідомлення?"
  );
});

module.exports = user;
