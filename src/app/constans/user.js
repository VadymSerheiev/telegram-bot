// MENU
// USER COMMANDS
const USER_COMMANDS = [
  { command: "start", description: "Перезавантажити бот" },
  { command: "tariffs", description: "Тарифні плани" },
  { command: "payment", description: "Передплата" }, // ?
  { command: "profile", description: "Мій профіль" }, // ?
  { command: "support", description: "Підтримка" },
  { command: "certificate", description: "Приклад сертифікату" },
  { command: "reviews", description: "Відгуки про нас" },
];

// MENU -> AFTER CLICK START
const GREETINGS =
  "Вітаємо!\n\nГоворити зі світом однією мовою — це просто! Щоб вивчити мову, достатньо почати з малої: записатися на курси. Найефективнішими визнані мовні курси за кордоном, коли студент повністю занурюється в іноземне мовне середовище і застосовує нові знання на практиці.";

// MENU -> MAIN
const TARIFF_PLANS = "🗓 Тарифні плани";
const PAYMENT = "💳 Передплата";
const MY_PROFILE = "👤 Мій профіль";
const SUPPORT = "🤝 Підтримка";
const CERTIFICATE = "🪪 Сертифікат";
const REVIEWS = "👍 Відгуки";

// MENU -> TARIFFS
const TARIFFS_DESCRIPTION =
  "Загальна інформація про тарифні плани з прикладом структури курсів.";

const TARIFF_A1 = "Тариф A1";
const TARIFF_A2 = "Тариф A2";
const TARIFF_B1 = "Тариф B1";

const BACK = "↩️ Повернутись";

const TARIFF_A1_DESCRIPTION =
  "Базовий рівень A1 – це основи мови; знання дозволяють вирішувати якісь прості побутові та повсякденні питання, зазвичай використовуються прості фрази та вирази.\n\nВартість - 100 $ (курс/міс)";
const TARIFF_A2_DESCRIPTION =
  "Базовий рівень A2 – це основи мови; знання дозволяють вирішувати якісь прості побутові та повсякденні питання, зазвичай використовуються прості фрази та вирази.\n\nВартість - 150 $ (курс/міс)";
const TARIFF_B1_DESCRIPTION =
  "Середній рівень B1 - це повноцінне знання мови та граматики, уміння будувати довгі фрази та ін., непоганий словниковий запас.\n\nВартість - 150 $ (курс/міс)";

// MENU -> PAYMENT
const PAYMENT_DESCRIPTION =
  "Оберіть, будь ласка, тариф за яким Ви бажаєте здійснити передплату.";

const PAY_NOW = "Сплатити зараз";
const LET_ME_THINK = "⏰ Хочу подумати, нагадайте";
const DONT_REMIND = "⛔️ Не нагадувати";

const REQUISITES = "Реквізити";

const ALL_TARIFFS = "↩️ Усі тарифи";

// MENU -> PROFILE
const UNPAID = "⛔️ Не сплачено";
const PENDING = "⏳ Перевіряється";
const PAID = "✅ Сплачено";

const USER_ID = "ID";
const USER_NAME = "User name";
const FIRST_NAME = "First name";
const LAST_NAME = "Last name";
const FULL_NAME = "Ім'я та прізвище";
const CHOOSED_COURSE = "Обраний курс";
const NOT_CHOOSED_COURSE = "➖ Не обрано";
const QUESTIONARY = "Про мене";
const PAYMENT_STATUS = "Про мене";

// MENU -> SUPPORT
const SUPPROT_CONTACT_NUMBER = "+380505736797";
const SUPPROT_CONTACT_NAME = "Vadym";

const SUPPORT_DESCRIPTION =
  "Якщо у Вас виникнуть будь-які питання, Ви можете звернутись до нашого менеджера.";

// MENU -> CERTIFICATE
const CERTIFICATE_FILE_NAME = "Приклад сертифікату";
const CERTIFICATE_DESCRIPTION =
  "Приклад сертифікату, який Ви отримаєте по завершенню курсу.";

// MENU -> REVIEWS
const REVIEWS_DESCRIPTION =
  "За цим посиланням Ви можете ознайомитись з відгуками про нас.";

// SYSTEM MESSAGES
const NO_PHOTO_CAPTION =
  "Вкажіть будь ласка ім'я та прізвище відправника у підписі до фото.";

const QUESTIONARY_FULL_NAME =
  "Напишіть будь ласка повне ім'я та прізвище відповіддю на це повідомлення. Ця інформація необхідна нам для зарахування Вас на курс та після завершення курсу для друку сертифікату.";
const QUESTIONARY_MESSAGE =
  "Давай трохи про тебе дізнаємося 😉\nНапиши, будь ласка, кілька речень про себе відповіддю на це повідомлення.";

const SORRY_RECRUITMENT_CLOSED =
  "Вибачте, в даний момент набір на курси зачинено.";

const WE_WILL_REMIND_YOU = "✅ Ми Вам нагадаємо про сплату.";
const NEVER_REMIND = "Ми більше не будемо Вам нагадувати про сплату 😉";

const NOT_CHOOSED_COURSE_MESSAGE = `Вибачте, Ви ще не обрали курс. Для того щоб обрати курс перейдіть будь ласка до пункту \"*${PAYMENT}*\" і оберіть будь ласка курс.`;
const ALREADY_PARTICIPANT = "Ви вже є учасником одного з курсів.";

const WORK_GRAPHIC =
  "Вибачте, наш робочий день завершився. Ми постараємося відповісти Вам якомога швидше.";

const RECIEVED_CHECK =
  "Наш менеджер отримав фото чеку. Після підтвердження платежу ви отримаєте повідомлення.";

const NICE_TO_MEET_YOU = "Приємно познайомитись 😉";
const EXTRA_INFO_QUESTIONARY =
  "Чим більше ми про тебе дізнаємось, тим краще 😉";

const FILE_UPLOAD_SUCCESS = "✅ Файл завантажено успішно.";
const UNKNOWN_COMMAND =
  "Вибачте, я не розумію цієї команди 🤷‍♂️ Можливо Ви хотіли відповісти на якесь моє повідомлення?";

const PAYMENT_SUCCESS = "✅ Оплата підтверджена.\nДякуємо Вам за оплату!";
const PAYMENT_FAIL = "Нажаль Ваш платіж не підтверджено. Зверніться будь ласка до підтримки.";

const INVITE_LINK = "Запрошення до нашого закритого каналу.";

const REMINDER = "⏰ Нагадуємо про сплату за тариф.";

module.exports = {
  CONSTANTS: {
    USER_COMMANDS,
    GREETINGS,
    TARIFF_PLANS,
    PAYMENT,
    MY_PROFILE,
    SUPPORT,
    CERTIFICATE,
    REVIEWS,
    TARIFFS_DESCRIPTION,
    TARIFF_A1,
    TARIFF_A2,
    TARIFF_B1,
    BACK,
    TARIFF_A1_DESCRIPTION,
    TARIFF_A2_DESCRIPTION,
    TARIFF_B1_DESCRIPTION,
    PAYMENT_DESCRIPTION,
    PAY_NOW,
    LET_ME_THINK,
    DONT_REMIND,
    REQUISITES,
    ALL_TARIFFS,
    UNPAID,
    PENDING,
    PAID,
    USER_ID,
    USER_NAME,
    FIRST_NAME,
    LAST_NAME,
    FULL_NAME,
    CHOOSED_COURSE,
    NOT_CHOOSED_COURSE,
    QUESTIONARY,
    PAYMENT_STATUS,
    SUPPROT_CONTACT_NUMBER,
    SUPPROT_CONTACT_NAME,
    SUPPORT_DESCRIPTION,
    CERTIFICATE_FILE_NAME,
    CERTIFICATE_DESCRIPTION,
    REVIEWS_DESCRIPTION,
    NO_PHOTO_CAPTION,
    QUESTIONARY_FULL_NAME,
    QUESTIONARY_MESSAGE,
    SORRY_RECRUITMENT_CLOSED,
    WE_WILL_REMIND_YOU,
    NEVER_REMIND,
    NOT_CHOOSED_COURSE_MESSAGE,
    ALREADY_PARTICIPANT,
    WORK_GRAPHIC,
    RECIEVED_CHECK,
    NICE_TO_MEET_YOU,
    EXTRA_INFO_QUESTIONARY,
    FILE_UPLOAD_SUCCESS,
    UNKNOWN_COMMAND,
    PAYMENT_SUCCESS,
    PAYMENT_FAIL,
    INVITE_LINK,
    REMINDER,
  },
};
