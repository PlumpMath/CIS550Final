
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FileSchema = new Schema({
	key: {type: String, default: '', trim: true, required: true },
	url: {type: String, default: '', trim: true, required: true },
	user_id: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true
	}
});

FileSchema.path('url').required(true, 'File must have a url');

module.exports = mongoose.model('File', FileSchema);