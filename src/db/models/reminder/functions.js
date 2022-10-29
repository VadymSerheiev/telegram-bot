const User = require("../user/user");
const Reminder = require("./reminder");

const initCreateReminder = async () => {
  const reminder = await Reminder.find({});

  if (Boolean(reminder.length)) return;

  console.log("init reminder doc");

  const newReminder = new Reminder();
  await newReminder.save();
};

const removeUserFromReminder = async (userId) => {
  await Reminder.findOneAndUpdate(
    {},
    {
      $pull: {
        remindUsers: {
          userId
        },
      },
    }
  );
}

const addUserToReminder = async (userId) => {
  const { choosedCourse, firstName, lastName, userName } = await User.findOne({
    userId: userId,
  });

  // remove if user already in reminder
  await removeUserFromReminder(userId);

  await Reminder.findOneAndUpdate(
    {},
    {
      $push: {
        remindUsers: {
          userId,
          firstName,
          lastName,
          userName,
          choosedCourse,
          timestamp: Date.now(),
        },
      },
    }
  );
};

const getUsersToRemind = async () => {
  const { remindUsers } = await Reminder.findOne({})

  const users = remindUsers.map((user) => {
    return {
      userId: user.userId,
      timestamp: user.timestamp,
    }
  })

  return users;
}

module.exports = {
  initCreateReminder,
  removeUserFromReminder,
  addUserToReminder,
  getUsersToRemind,
};
