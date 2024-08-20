const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRouter = require('./routes/auth');
const contactsRouter = require('./routes/contacts'); 

const app = express();

app.use(express.json());
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));

app.use('/auth', authRouter);
app.use('/api/contacts', contactsRouter); 

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
