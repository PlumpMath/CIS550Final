const mongoose = require('mongoose'); 

const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true},
  password: { type: String },
  first: { type: String, required: true, trim: true},
  last: { type: String, required: true, trim: true}
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.path('email').required(true, 'User must have an email');

module.exports = mongoose.model('User', UserSchema);