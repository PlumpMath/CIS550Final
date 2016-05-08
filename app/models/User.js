const mongoose = require('mongoose');

const Schema = mongoose.Schema;

userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true},
  password: { type: String, required: true},
  name: {
      first: { type: String, required: true, trim: true},
      last: { type: String, required: true, trim: true}
  },
  Age: Number,
});

userSchema.path('eamil').required(true, 'User must have an email');
userSchema.path('password').required(true, 'User must have a password');
userSchema.path('name').required(true, 'User must have a name');

mongoose.model('User', userSchema);