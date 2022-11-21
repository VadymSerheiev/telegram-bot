const fetch = require("node-fetch");
const fs = require('fs');

const generateDate = () => {
  const date = new Date();

  const DD = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const MM =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const YYYY = date.getFullYear();

  const hh = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const mm =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

  return `${DD}-${MM}-${YYYY}-${hh}-${mm}`;
};

const getCallbackChatAndMessageId = (ctx) => {
  const chat_id = ctx.update.callback_query.message.chat.id;
  const message_id = ctx.update.callback_query.message.message_id;
  const userId = ctx.update.callback_query.from.id;

  return { userId, chat_id, message_id };
};

const uploadFile = async (fileId, fileName) => {
  await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`)
    .then((res) => res.buffer())
    .then((buffer) => {
      return fs.promises.writeFile(
        `src/files/${
          fileName.charAt(0).toLowerCase() + fileName.slice(1)
        }.pdf`,
        buffer
      );
    })
    .then(() => {
      console.log("done");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  generateDate,
  getCallbackChatAndMessageId,
  uploadFile,
};
