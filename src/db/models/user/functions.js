const Course = require("../course/course");
const User = require("./user");

const checkAndCreateNewUser = async (ctx) => {
  const {
    id: userId,
    first_name: firstName = "",
    last_name: lastName = "",
    username: userName = "",
  } = ctx.from;

  // need?
  // try {
  const user = await User.findOne({ userId });

  // if not found in database creates profile
  if (!Boolean(user)) {
    const timestamp = Date.now();

    const newUser = new User({
      userId,
      firstName,
      lastName,
      userName,
      registrationTimestamp: timestamp,
    });

    // creates profile for every new user
    // user can't wait, so without await
    await newUser.save();

    //   await newUser.save();
    // } catch (e) {
    //   console.log(e);
    // }
  }
};

const getChoosedCourse = async (ctx) => {
  const { id: userId } = ctx.from;
  const { choosedCourse } = await User.findOne({ userId: userId});
  return choosedCourse;
};

const getUsersIds = async () => {
  const users = await User.find({});
  return users
    .map(({ userId, firstName, lastName }) =>
      `${firstName} ${lastName}: ${userId}`.trim()
    )
    .join("\n");
};

const setChoosedCourse = async (userId, tariff) => {
  await User.findOneAndUpdate({ userId }, { $set: { choosedCourse: tariff } });
};

const checkIsCourseClosed = async (ctx, tariff) => {
  const { isRecruitmentOpened } = await Course.findOne({
    shortName: tariff,
    isCourseFinished: false,
  });

  if (!Boolean(isRecruitmentOpened)) {
    ctx.reply(
      "Вибачте, набір на цей курс тимчасово призупинено."
    );
    return true;
  }

  return false;
};

const checkIfUserAlreadyInQueue = async (userId) => {
  await Course.updateMany(
    { isCourseFinished: false },
    {
      $pull: {
        participantsFirstQueue: { userId },
      },
    }
  );
};

// split on smaller functions
const setWantToPayTariff = async (ctx) => {
  const userId = ctx.update.callback_query.from.id;

  const { choosedCourse, firstName, lastName, userName, fullName } =
    await User.findOne({
      userId: userId,
    });

  // check if user already in queue and remove him
  await checkIfUserAlreadyInQueue(userId);
  // don't add if participant already in participants

  const {
    maxParticipants: joinedMaxParticipants,
    participants: joinedParticipants,
    participantsFirstQueue: joinedParticipantsFirstQueue,
  } = await Course.findOneAndUpdate(
    { shortName: choosedCourse, isCourseFinished: false },
    {
      $push: {
        participantsFirstQueue: {
          userId,
          firstName,
          lastName,
          userName,
          fullName,
          timestamp: Date.now(),
        },
      },
    },
    { new: true }
  );

  const joinedAllParticipants =
    joinedParticipants.length + joinedParticipantsFirstQueue.length;

  if (joinedAllParticipants >= joinedMaxParticipants) {
    await Course.findOneAndUpdate(
      { shortName: choosedCourse, isCourseFinished: false },
      { $set: { isRecruitmentOpened: false } }
    );

    // await ctx.api.sendMessage(
    //   process.env.BOT_ADMIN_ID,
    //   `Набор на курсы ${choosedCourse} - временно закрыт.`
    // );
  }

  // if (Boolean(choosedCourse)) {
  //   const {
  //     maxParticipants: leftMaxParticipants,
  //     participants: leftParticipants,
  //     participantsFirstQueue: leftParticipantsFirstQueue,
  //   } = await Course.findOne({ shortName: choosedCourse });

  //   const allParticipantsLeft =
  //     leftParticipants.length + leftParticipantsFirstQueue.length;

  //   if (allParticipantsLeft < leftMaxParticipants && choosedCourse !== tariff) {
  //     await Course.findOneAndUpdate(
  //       {
  //         shortName: choosedCourse,
  //         isRecruitmentOpened: false,
  //         recruitmentClosed: true,
  //       },
  //       { $set: { isRecruitmentOpened: true, recruitmentClosed: false } }
  //     );

  //     await ctx.api.sendMessage(
  //       process.env.BOT_ADMIN_ID,
  //       `Набор на курсы ${choosedCourse} - снова открыт.`
  //     );
  //   }
  // }
};

const moveUserFromQueryToParticipants = async (userId) => {
  const { choosedCourse, firstName, lastName, userName } =
    await User.findOneAndUpdate(
      {
        userId: userId,
      },
      { $set: { paymentStatus: "paid" } }
    );

  // delete from all courses queris if user choose another course after
  await checkIfUserAlreadyInQueue(userId);

  await Course.findOneAndUpdate(
    { shortName: choosedCourse, isCourseFinished: false },
    {
      $push: {
        participants: {
          userId,
          firstName,
          lastName,
          userName,
          timestamp: Date.now(),
        },
      },
    }
  );

  return choosedCourse;
};

const checkIsAdmin = (ctx) => {
  let {id = ""} = ctx.from;

  if (
    String(id) === process.env.BOT_ADMIN_ID ||
    String(id) === process.env.BOT_SUPPORT_ID
  ) {
    return true;
  }

  return false;
};

module.exports = {
  checkAndCreateNewUser,
  getUsersIds,
  setWantToPayTariff,
  setChoosedCourse,
  checkIsCourseClosed,
  moveUserFromQueryToParticipants,
  getChoosedCourse,
  checkIsAdmin
};
