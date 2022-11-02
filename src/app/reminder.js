const { Bot } = require("grammy");
const Course = require("../db/models/course/course");
const { getUsersToRemind } = require("../db/models/reminder/functions");
const { userKeyboards } = require("./keyboards/user");
const bot = new Bot(process.env.BOT_TOKEN);

var CronJob = require("cron").CronJob;
// every day at 12 pm (UTC)
var reminder = new CronJob("0 0 12 * * *", async () => {
  const users = await getUsersToRemind();
  users.forEach(async (user) => {
    const ms = Date.now() - user.timestamp
  const hours = (ms / (1000 * 60 * 60)).toFixed(0);
  console.log(hours)

  // check and remind every 2 days
    if (hours >= 48) {
    await bot.api.sendMessage(user.userId, "⏰ Нагадуємо про сплату за тариф.", 
      {
        reply_markup: userKeyboards.notRemind,
        parse_mode: "Markdown",
      }
    );
    }
    
  });
});
// Use this if the 4th param is default value(false)
reminder.start();
