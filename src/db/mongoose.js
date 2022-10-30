const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true
}).then(
    () => { console.log('db - succesfully connected') },
    err => { console.log('db - conntection error', err) }
  );
