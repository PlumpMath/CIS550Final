const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
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

const MongoDB = join(__dirname, 'app/models/MongoDB');
const MySQL = require('./app/models/MySQL');

const app = express();
app.set('views', __dirname + '/views'); // general config
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

module.exports = app;

// Bootstrap models
fs.readdirSync(MongoDB)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(MongoDB, file)));

mongoose.connect(MONGO_URL);

const mongodb = mongoose.connection;

const extractorModule = require('./old/extractor.js');

const linkerModule = require('./old/linker.js');



mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongodb.once('open', () => {
	console.log('Connected to', MONGO_URL);
});


var connection;
function createRawMySQLConnection()
{
  var mysql = require('mysql');

  // connection  = mysql.createConnection({
  //     host     : 'datalake550.chyq7der4m33.us-east-1.rds.amazonaws.com',
  //     user     : 'shrekshao',
  //     password : '12345678',
  //     database : 'datalake550'
  // });
  connection  = mysql.createConnection({
      host     : process.env.MYSQL_HOST,
      user     : process.env.MYSQL_USER,
      password : process.env.MYSQL_PASSWORD,
      database : process.env.MYSQL_DB
  });

  connection.connect();
} 
createRawMySQLConnection();


app.get('/', (req, res) => {
  res.render('index', { title: 'CIS550 Datalake', message: 'Welcome to CIS550 Datalake'});

  var extractor = new extractorModule.Extractor();
  //test
  // extractor.addFile(req.body);

  // // for s3: url, bucket, fileKey, fileID
  // console.log('add local file test');
  // extractor.initConnection(connection);
  // //extractor.addFile('./old/test-data/de.1.clubs.json', null, null, 'file-1');
  // extractor.addFile('./old/test-data/1-bundesliga.csv', null, null, 'file-2');

  console.log('query from mongo test');
  var linker = new linkerModule.Linker();
    
  linker.searchQuery(['2013-08-09','2-4'], function(result){console.log(result)});
})

app.post('/file', (req, res) => {
  console.log(req.body);
  res.render('index', { title: 'CIS550 Datalake', message: 'Welcome to CIS550 Datalake'})
})

MySQL.sequelize.sync().then(() => {
  app.listen(APP_PORT, () => {
    console.log('CIS550 Final Project started on port', APP_PORT);
  })
}, (err) => {
	console.log(err);
})
