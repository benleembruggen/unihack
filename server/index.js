require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();
app.use(cookieParser());
app.use(express.json());

// mongo db
const CONNECTION_URL = `mongodb+srv://unihack:qda9MGxsNN2EHTRN@cluster0.mbkuu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  )
  .catch((error) => console.log(error.message));

mongoose.set('useFindAndModify', false);

// user routes
const userRouter = require('./routes/User');
app.use('/user', userRouter);