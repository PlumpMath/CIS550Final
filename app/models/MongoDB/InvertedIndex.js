const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InvertedIndexSchema = new Schema({
	keyword: {type: String, default: '', trim: true, unique: true},
	vertex_ids: [String]
});

InvertedIndexSchema.path('keyword').required(true, 'Inverted Index must have a keyword');

module.exports = mongoose.model('InvertedIndex', InvertedIndexSchema);