const { InlineKeyboard, Keyboard } = require("grammy");
const { ADMIN_CONSTANTS } = require("../constans/admin");
const { CONSTANTS } = require("../constans/user");

const filesUpload = new InlineKeyboard()
  .text(ADMIN_CONSTANTS.CERTIFICATE, "uploadCertificate").row()
  .text(ADMIN_CONSTANTS.STRUCTURE_COURSE_A1, "uploadStructureA1").row()
  .text(ADMIN_CONSTANTS.STRUCTURE_COURSE_A2, "uploadStructureA2").row()
  .text(ADMIN_CONSTANTS.STRUCTURE_COURSE_B1, "uploadStructureB1").row()

const backFilesUpload = new InlineKeyboard()
  .text(CONSTANTS.BACK, "backFilesUpload").row()

const sureCloseCourses = new InlineKeyboard()
  .text(ADMIN_CONSTANTS.YES, "sureCloseCourses").row()
  .text(ADMIN_CONSTANTS.NO, "notSureCloseCourses").row()

module.exports = {
  adminKeyboards: {
    filesUpload, 
    backFilesUpload,
    sureCloseCourses,
  },
};