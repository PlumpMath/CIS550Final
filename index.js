const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const envvar = require('envvar');
const express = require('express');
const fs = require('fs');
const join = require('path').join;
const mongoose = require('mongoose');
const Sequelize = require('sequelize');

const APP_PORT = envvar.number('APP_PORT', 8080);
const AWS_ACCESS_KEY_ID = envvar.string('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = envvar.string('AWS_SECRET_ACCESS_KEY');
const MONGO_URL = envvar.string('MONGO_URL');
const MYSQL_HOST = envvar.string('MYSQL_HOST');
const MYSQL_DB = envvar.string('MYSQL_DB');
const MYSQL_USER = envvar.string('MYSQL_USER');
const MYSQL_PASSWORD = envvar.string('MYSQL_PASSWORD');

const models = join(__dirname, 'app/models');
const app = express();
app.set('view-engine', 'pug');

module.exports = app;

fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

mongoose.connect(MONGO_URL);

const mongodb = mongoose.connection;

const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, {
	host: MYSQL_HOST
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

Vertex.belongsToMany(Vertex, { as: 'Edge', foreignKey: 'VertexId', through: 'Edges'})

mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongodb.once('open', () => {
	console.log('Connected to', MONGO_URL);
});

app.get('/')

sequelize.sync().then(() => {
  app.listen(APP_PORT, () => {
    console.log('CIS550 Final Project started on port', APP_PORT);
  })
}, (err) => {
	console.log(err);
})
