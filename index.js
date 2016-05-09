const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const envvar = require('envvar');
const express = require('express');
const fs = require('fs');
const join = require('path').join;
const mongoose = require('mongoose');
const multer = require('multer');
const R = require('ramda');
const S3 = require('multer-s3');
const Sequelize = require('sequelize');
const validUrl = require('valid-url');

const APP_PORT = envvar.number('APP_PORT', 8080);
const AWS_ACCESS_KEY_ID = envvar.string('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = envvar.string('AWS_SECRET_ACCESS_KEY');
const AWS_S3_BUCKET = envvar.string('AWS_S3_BUCKET');
const MONGO_URL = envvar.string('MONGO_URL');
const MYSQL_HOST = envvar.string('MYSQL_HOST');
const MYSQL_DB = envvar.string('MYSQL_DB');
const MYSQL_USER = envvar.string('MYSQL_USER');
const MYSQL_PASSWORD = envvar.string('MYSQL_PASSWORD');

const MongoDB = join(__dirname, 'app/models/MongoDB');
const MySQL = require('./app/models/MySQL');

const getDateTime = () => {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

const upload = multer({storage: S3({
    dirname: '/',
    bucket: AWS_S3_BUCKET,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    accessKeyId: AWS_ACCESS_KEY_ID,
    region: 'us-east-1',
    filename: (req, file, cb) => {
      cb(null, getDateTime() + '_' + file.originalname)
    }
  })
});


const app = express();
app.set('views', __dirname + '/views'); // general config
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

module.exports = app;

// Bootstrap models
fs.readdirSync(MongoDB)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(MongoDB, file)));

mongoose.connect(MONGO_URL);

const mongodb = mongoose.connection;

mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongodb.once('open', () => {
	console.log('Connected to', MONGO_URL);
});

app.get('/', (req, res) => {
  res.render('index', { title: 'CIS550 Datalake', message: 'Welcome to CIS550 Datalake'});
})

app.post('/file', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(403).send('No file found!').end();
  }

  const file = req.file;

  const mimeTypes = ['application/xml', 'text/xml', 'application/json', 'text/csv'];

  if(R.not(R.contains(file.mimetype, mimeTypes))) {
    return res.status(403).send('Unsupported File Type!').end()
  }

  console.log(file);

  const date = new Date();
  
  

  const newFileName = getDateTime() + '_' + file.originalname;
  
  const uploadParams = {
    Bucket: AWS_S3_BUCKET,
    Key: newFileName,
    Body: fs.createReadStream(file.path)
  };

  // if (validUrl.isUri(url)) {

  //   // upload to s3
  //   // create mongodb 

  //   res.render('file', { title: 'CIS550 Datalake | New File', message: 'New File Added!' })
  // } else {

  // }
  
})

MySQL.sequelize.sync().then(() => {
  app.listen(APP_PORT, () => {
    console.log('CIS550 Final Project started on port', APP_PORT);
  })
}, (err) => {
	console.log(err);
})
