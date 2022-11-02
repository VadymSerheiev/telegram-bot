const { Bot } = require("grammy");
const Course = require("../db/models/course/course");
const { getUsersToRemind } = require("../db/models/reminder/functions");
const Reminder = require("../db/models/reminder/reminder");
const User = require("../db/models/user/user");
const { userKeyboards } = require("./keyboards/user");
const bot = new Bot(process.env.BOT_TOKEN);
const CronJob = require("cron").CronJob;
const { Dropbox } = require("dropbox");


const getAllCollections = async () => {
    const courses = await Course.find({});
    const users = await User.find({});
    const reminder = await Reminder.find({})
    return {
      courses,
      users,
      reminder
    }
  }

// every day at 12 pm (UTC)
const replicator = new CronJob("0 0 12 * * *", async () => {
  const allCollections = await getAllCollections();
  const allCollectionsJSON = JSON.stringify(allCollections);
  
  const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN});
  dbx.filesUpload({
      path: `/backup-${new Date().toLocaleDateString()}-${new Date()
        .toLocaleTimeString()
        .split(":")
        .join("")}.json`,
      contents: allCollectionsJSON,
    })
    .then(function (response) {
      console.log(response.status);
    })
    .catch(function (error) {
      console.error(error);
    });
});
// Use this if the 4th param is default value(false)
replicator.start();