const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const envvar = require('envvar');
const express = require('express');
const fs = require('fs');
const join = require('path').join;
const mongoose = require('mongoose');
const Sequelize = require('sequelize');

const extractorModule = require('./old/extractor.js');


const APP_PORT = envvar.number('APP_PORT', 8080);
const AWS_ACCESS_KEY_ID = envvar.string('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = envvar.string('AWS_SECRET_ACCESS_KEY');
const MONGO_URL = envvar.string('MONGO_URL');
const MYSQL_HOST = envvar.string('MYSQL_HOST');
const MYSQL_DB = envvar.string('MYSQL_DB');
const MYSQL_USER = envvar.string('MYSQL_USER');
const MYSQL_PASSWORD = envvar.string('MYSQL_PASSWORD');

const Users = require('./app/models/MongoDB/User');
const Files = require('./app/models/MongoDB/File');
const InvertedIndex = require('./app/models/MongoDB/InvertedIndex');
const MySQL = require('./app/models/MySQL');

const app = express();
app.set('views', __dirname + '/views'); // general config
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


module.exports = app;

mongoose.connect(MONGO_URL);

const mongodb = mongoose.connection;


mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongodb.once('open', () => {
	console.log('Connected to', MONGO_URL);
});

app.get('/', (req, res) => {
  res.render('index', { title: 'CIS550 Datalake', message: 'Welcome to CIS550 Datalake'});

  var extractor = new extractorModule.Extractor();
  //test
  // extractor.addFile(req.body);

  // for s3: url, bucket, fileKey, fileID
  extractor.addFile('./old/test-data/de.1.clubs.json', null, null, 'file-1');
})

app.post('/file', (req, res) => {
  console.log(req.body);
  
})

MySQL.sequelize.sync().then(() => {
  app.listen(APP_PORT, () => {
    console.log('CIS550 Final Project started on port', APP_PORT);
  })
}, (err) => {
	console.log(err);
})
