const { Bot } = require("grammy");
const Course = require("../db/models/course/course");
const { getUsersToRemind } = require("../db/models/reminder/functions");
const Reminder = require("../db/models/reminder/reminder");
const User = require("../db/models/user/user");
const { userKeyboards } = require("./keyboards/user");
const bot = new Bot(process.env.BOT_TOKEN);
const CronJob = require("cron").CronJob;
const { Dropbox } = require("dropbox");
const { default: fetch } = require("node-fetch");
const { google } = require("googleapis");

const getAllCollections = async () => {
  const courses = await Course.find({});
  const users = await User.find({});
  const reminder = await Reminder.find({});
  return {
    courses,
    users,
    reminder,
  };
};

const createAndUploadFile = async (data, type, folder) => {
  const FILEKEYPATH = "telegram-bot-backups.json";
  const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    keyFile: FILEKEYPATH,
    scopes: SCOPES,
  });

  const driveService = google.drive({ version: "v3", auth });

  const folderId = (folder) => {
    switch(folder) {
      case "backups":
        return "1dC1wzoJ_mFyOt96rnByagprBzhl-QVe7";
      case "checks":
        return "1zIxX-_opbk7fgnm5sMRUf0Ad-TW7xOR9";
    }
  }

  if (type === "check") {
    var fileMetadata = {
      name: `check-${Date.now()}.jpg`,
      parents: [folderId(folder)],
    };

    const { result } = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${data}`).then((res) => res.json());
    const response = await fetch(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${result.file_path}`)
    
    var media = {
      body: response.body,
    };
  
    await driveService.files.create({
      resource: fileMetadata,
      media: media,
    });

    return;
  }

  var fileMetadata = {
    name: `${type}-${Date.now()}.json`,
    parents: [folderId(folder)],
  };

  var media = {
    body: JSON.stringify(data),
  };

  await driveService.files.create({
    resource: fileMetadata,
    media: media,
  });
};

// every day at 12 pm (UTC)
const replicator = new CronJob("0 0 12 * * *", async () => {
  const allCollections = await getAllCollections();
  await createAndUploadFile(allCollections,'backup','backups');
});
// Use this if the 4th param is default value(false)
replicator.start();

module.exports = {
  getAllCollections,
  createAndUploadFile
};
