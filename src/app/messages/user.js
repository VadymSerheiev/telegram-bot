const { CONSTANTS } = require("../constans/user");

const getRequisitesMessage = (tariff, card, fullname, sum) => {

  return `${CONSTANTS.PAYMENT} ➡️ Тариф ${tariff} ➡️ <b>Реквізити</b>\n\nНомер картки: <pre>${card}</pre>\n${fullname}\nДо сплати: ${sum}\n\nПісля оплати надішліть нам, будь ласка, фото чека. У коментарі до фото обов'язково вкажіть ім'я та прізвище відправника. Наш менеджер перевірить оплату і Ви отримаєте повідомлення.\n\nТакож після підтвердження оплати Ви отримаєте запрошення до закритого каналу для учасників курсу.`;
};

const requisitesMessageA1 = getRequisitesMessage(
  "A1",
  "0123456789101112",
  "ФІО",
  "100$"
);
const requisitesMessageA2 = getRequisitesMessage(
  "A2",
  "0123456789101112",
  "ФІО",
  "150$"
);
const requisitesMessageB1 = getRequisitesMessage(
  "B1",
  "0123456789101112",
  "ФІО",
  "200$"
);

module.exports = {
  userMessages: {
    requisitesMessageA1,
    requisitesMessageA2,
    requisitesMessageB1,
  },
};
