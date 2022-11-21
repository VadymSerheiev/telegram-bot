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
const { getCallbackChatAndMessageId, uploadFile } = require("../functions");

const bot = new Bot(process.env.BOT_TOKEN);

const messages = new Composer();

messages.on("message", async (ctx) => {
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
    const isOpened = await isRecruitmentOpened();
    if (!isOpened) {
      return await ctx.reply("Вибачте, в даний момент набір на курси зачинено.");
    }

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
      ? `\n*Ім'я та прізвище*: \`${me.fullName}\``
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
    const now = new Date();
    if ((now.getUTCHours() <= 6) || (now.getUTCHours() >= 18)) {
      await ctx.reply("Вибачте, наш робочий день завершився. Ми постараємося відповісти Вам якомога швидше.")
    }

    await ctx.replyWithContact("+380505736797", "Vadym");
    await ctx.reply(
      "Якщо у Вас виникнуть будь-які питання, Ви можете звернутись до нашого менеджера."
    );

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.CERTIFICATE) {
    const chat_id = ctx.update.message.chat.id;

    await bot.api.sendDocument(
      chat_id,
      new InputFile("src/files/certificate.pdf", "Приклад сертифікату.pdf"),
      {
        caption: "Приклад сертифікату, який Ви отримаєте по завершенню курсу.",
      }
    );

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.REVIEWS) {
    await ctx.reply(
      `За цим посиланням Ви можете ознайомитись з відгуками про нас.`,
      {
        reply_markup: userKeyboards.reviewsButton,
        parse_mode: "Markdown",
      }
    );

    return;
  }

  if (
    ctx?.update?.message?.reply_to_message?.text.includes(CONSTANTS.FULL_NAME)
  ) {
    const fullName = ctx?.update?.message?.text;
    await User.findOneAndUpdate(
      { userId: ctx.from.id },
      { $set: { fullName: fullName } }
    );

    await ctx.reply(CONSTANTS.QUESTIONARY);

    return;
  }

  if (
    ctx?.update?.message?.reply_to_message?.text.includes(CONSTANTS.QUESTIONARY)
  ) {
    const { questionary } = await User.findOne({ userId: ctx.from.id });
    await User.findOneAndUpdate(
      { userId: ctx.from.id },
      { $set: { questionary: `${Boolean(questionary.length) ? `${questionary} ${ctx?.update?.message?.text}` : `${ctx?.update?.message?.text}`}` } }
    );

    if (!questionary.length) {
      ctx.reply("Приємно познайомитись 😉");
    } else {
      ctx.reply("Чим більше ми про тебе дізнаємось, тим краще 😉");
    }

    return;
  }

  if (
    ["Certificate", "StructureA1", "StructureA2", "StructureB1"].some(
      (element) => element === ctx?.update?.message?.reply_to_message?.text
    )
  ) {
    // if (!ctx?.update?.message?.text.includes('https://')) {
    //   await ctx.reply("Вибачте, Ви неправильно вказали посилання на файл.");
    // }

    // function to upload
    await uploadFile(
      ctx?.update?.message?.text,
      ctx?.update?.message?.reply_to_message?.text
    );

    await ctx.reply("✅ Файл завантажено успішно.");

    return;
  }

  await ctx.reply(
    "Вибачте, я не розумію цієї команди 🤷‍♂️ Можливо Ви хотіли відповісти на якесь моє повідомлення?"
  );
});

module.exports = messages;
