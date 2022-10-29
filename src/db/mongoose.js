const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true
}).then(
    () => { console.log('succesfully connected to db') },
    err => { console.log('conntection error to db', err) }
  );
