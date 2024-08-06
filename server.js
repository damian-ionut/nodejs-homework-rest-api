const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const authRouter = require('./routes/auth');
const contactsRouter = require('./routes/contacts');
const handleErrors = require('./helpers/handleErrors');

const app = express();
app.use(express.json());

app.use('/users', authRouter);
app.use('/contacts', contactsRouter);

app.use(handleErrors);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
