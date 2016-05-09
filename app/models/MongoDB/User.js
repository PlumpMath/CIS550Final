const mongoose = require('mongoose'); 

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true},
  name: {
      first: { type: String, required: true, trim: true},
      last: { type: String, required: true, trim: true}
  },
  age: Number,
});

UserSchema.path('email').required(true, 'User must have an email');
UserSchema.path('password').required(true, 'User must have a password');

module.exports = mongoose.model('User', UserSchema);