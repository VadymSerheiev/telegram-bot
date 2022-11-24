// modules
const { Composer, Bot } = require("grammy");
const { InputFile } = require("grammy");
// constants
const { CONSTANTS } = require("../constans/user");
// functions
const { isRecruitmentOpened } = require("../../db/models/user/functions");
const { uploadFile } = require("../functions");
// keyboards
const { userKeyboards } = require("../keyboards/user");
// models
const User = require("../../db/models/user/user");


const bot = new Bot(process.env.BOT_TOKEN);

const messages = new Composer();

messages.on("message", async (ctx) => {
  if (ctx?.update?.message?.text === CONSTANTS.TARIFF_PLANS) {
    ctx.reply(
      `*${CONSTANTS.TARIFF_PLANS}*\n\n${CONSTANTS.TARIFFS_DESCRIPTION}`,
      {
        reply_markup: userKeyboards.tariffPlans,
        parse_mode: "Markdown",
      }
    );

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.PAYMENT) {
    const isOpened = await isRecruitmentOpened();
    if (!isOpened) {
      return await ctx.reply(CONSTANTS.SORRY_RECRUITMENT_CLOSED);
    }

    ctx.reply(`*${CONSTANTS.PAYMENT}\n\n*${CONSTANTS.PAYMENT_DESCRIPTION}`, {
      reply_markup: userKeyboards.tariffsMenu,
      parse_mode: "Markdown",
    });

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.MY_PROFILE) {
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

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.SUPPORT) {
    const now = new Date();
    if (now.getUTCHours() <= 6 || now.getUTCHours() >= 18) {
      await ctx.reply(CONSTANTS.WORK_GRAPHIC);
    }

    await ctx.replyWithContact(
      CONSTANTS.SUPPROT_CONTACT_NUMBER,
      CONSTANTS.SUPPROT_CONTACT_NAME
    );
    await ctx.reply(CONSTANTS.SUPPORT_DESCRIPTION);

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.CERTIFICATE) {
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

    return;
  }

  if (ctx?.update?.message?.text === CONSTANTS.REVIEWS) {
    await ctx.reply(CONSTANTS.REVIEWS_DESCRIPTION, {
      reply_markup: userKeyboards.reviewsButton,
      parse_mode: "Markdown",
    });

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
      {
        $set: {
          questionary: `${
            Boolean(questionary.length)
              ? `${questionary} ${ctx?.update?.message?.text}`
              : `${ctx?.update?.message?.text}`
          }`,
        },
      }
    );

    if (!questionary.length) {
      ctx.reply(CONSTANTS.NICE_TO_MEET_YOU);
    } else {
      ctx.reply(CONSTANTS.EXTRA_INFO_QUESTIONARY);
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

    await ctx.reply(CONSTANTS.FILE_UPLOAD_SUCCESS);

    return;
  }

  await ctx.reply(CONSTANTS.UNKNOWN_COMMAND);
});

module.exports = messages;
