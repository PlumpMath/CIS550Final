const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const envvar = require('envvar');
const express = require('express');
const mongoose = require('mongoose');
const Sequelize = require('sequelize');

const APP_PORT = envvar.number('APP_PORT', 8080);
const AWS_ACCESS_KEY_ID = envvar.string('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = envvar.string('AWS_SECRET_ACCESS_KEY');
const MONGO_URL = envvar.string('MONGO_URL');
const MYSQL_HOST = envvar.string('MYSQL_HOST');
const MYSQL_USER = envvar.string('MYSQL_USER');
const MYSQL_PASSWORD = envvar.string('MYSQL_PASSWORD');

const app = express();
app.set('view-engine', 'pug');

mongoose.connect(MONGO_URL);

const mongodb = mongoose.connection;

console.log(MYSQL_HOST);

const sequelize = new Sequelize(MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, {
	dialectOptions: {
    	socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  	}
});

const File = mongoose.model('File', {
	url: String
});

const Vertex = sequelize.define('Vertex', {
	vertex_id: {
    	type: Sequelize.UUID,
    	defaultValue: Sequelize.UUIDV1,
    	primaryKey: true
  	},
  	value: Sequelize.STRING,
  	is_leaf: Sequelize.BOOLEAN,
  	file_id: Sequelize.STRING
});

Vertex.hasMany(Vertex, { as: 'edge'})

mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongodb.once('open', () => {
	console.log('Connected to', MONGO_URL);
});

app.get('/')

sequelize.sync().then(() => {
	console.log("here");
}, (err) => {
	console.log(err);
})
