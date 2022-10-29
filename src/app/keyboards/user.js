const { InlineKeyboard, Keyboard } = require("grammy");
const { CONSTANTS } = require("../constans/user");

const mainMenu = new Keyboard()
  .text(CONSTANTS.TARIFF_PLANS)
  .text(CONSTANTS.MY_PAYMENT)
  .row()
  .text(CONSTANTS.MY_PROFILE)
  .text(CONSTANTS.SUPPORT)
  .resized();

const tariffPlans = new InlineKeyboard()
  .text("Тариф А1", "infoTariffA1")
  .row()
  .text("Тариф А2", "infoTariffA2")
  .row()
  .text("Тариф В1", "infoTariffB1")
  .row();

const backTariffPlans = new InlineKeyboard().text(CONSTANTS.BACK, "backTariffPlans").row();

const tariffsMenu = new InlineKeyboard()
  .text("Тариф А1", "chooseTariffA1")
  .row()
  .text("Тариф А2", "chooseTariffA2")
  .row()
  .text("Тариф В1", "chooseTariffB1")
  .row();

const createSingleTariffMenu = (tariff) => {
  return new InlineKeyboard()
    .text(CONSTANTS.PAY_NOW, `payNow${tariff}`)
    .row()
    .text(CONSTANTS.LET_ME_THINK,"remind")
    .row()
    .text(CONSTANTS.DONT_REMIND, "notRemind")
    .row()
    .text(CONSTANTS.BACK, "backTariffs")
    .row();
};

const singleTariffA1Menu = createSingleTariffMenu("A1");
const singleTariffA2Menu = createSingleTariffMenu("A2");
const singleTariffB1Menu = createSingleTariffMenu("B1");

const createRequisitesMenu = (tariff) => {
  return new InlineKeyboard()
    .text(CONSTANTS.BACK, `returnTariff${tariff}`)
    .row()
    .text("↩️ Усі тарифи", "backTariffs")
    .row();
};

const requisitesA1Menu = createRequisitesMenu("A1");
const requisitesA2Menu = createRequisitesMenu("A2");
const requisitesB1Menu = createRequisitesMenu("B1");

const notRemind = new InlineKeyboard()
  .text(CONSTANTS.DONT_REMIND, "notRemind")
  .row()

module.exports = {
  userKeyboards: {
    mainMenu,
    tariffPlans,
    backTariffPlans,
    tariffsMenu,
    singleTariffA1Menu,
    singleTariffA2Menu,
    singleTariffB1Menu,
    requisitesA1Menu,
    requisitesA2Menu,
    requisitesB1Menu,
    notRemind,
  },
};
