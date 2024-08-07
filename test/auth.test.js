const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /users/login', () => {
  it('should log in a user and return a token', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashedPassword });

    const response = await request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toEqual(expect.objectContaining({
      email: expect.any(String),
      subscription: expect.any(String),
    }));
  });
});
