const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InvertedIndexSchema = new Schema({
	keyword: {type: String, default: '', trim: true, unique: true},
	vertex_ids: [{
		vertex_id :{type: String}
	}]
});

InvertedIndexSchema.path('keyword').required(true, 'Inverted Index must have a keyword');

mongoose.model('Inverted_Index', InvertedIndexSchema);