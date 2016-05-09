
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FileSchema = new Schema({
	url: {type: String, default: '', trim: true }
});

FileSchema.path('url').required(true, 'File must have a url');

module.exports = mongoose.model('File', FileSchema);