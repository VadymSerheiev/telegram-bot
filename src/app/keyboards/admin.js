const { InlineKeyboard, Keyboard } = require("grammy");
const { CONSTANTS } = require("../constans/user");

const filesUpload = new InlineKeyboard()
  .text('Сертифікат', "uploadCertificate").row()
  .text('Структура курсу A1', "uploadStructureA1").row()
  .text('Структура курсу A2', "uploadStructureA2").row()
  .text('Структура курсу B1', "uploadStructureB1").row()

const backFilesUpload = new InlineKeyboard()
  .text(CONSTANTS.BACK, "backFilesUpload").row()

const sureCloseCourses = new InlineKeyboard()
  .text("✅ Так", "sureCloseCourses").row()
  .text("🚫 Ні", "notSureCloseCourses").row()

module.exports = {
  adminKeyboards: {
    filesUpload, 
    backFilesUpload,
    sureCloseCourses,
  },
};