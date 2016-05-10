const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const envvar = require('envvar');
const express = require('express');
const fs = require('fs');
const join = require('path').join;
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const multer = require('multer');
const passport = require('passport');
const path = require('path');
const R = require('ramda');
const session = require('express-session');
const multerS3 = require('multer-s3');
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

  return year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;

}

function createRawMySQLConnection()
{
  const mysql = require('mysql');

  return mysql.createConnection({
      host     : MYSQL_HOST,
      user     : MYSQL_USER,
      password : MYSQL_PASSWORD,
      database : MYSQL_DB
  });
} 

const app = express();
const s3 = new AWS.S3({ });

app.set('views', __dirname + '/views'); // general config
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(session({ 
  secret: 'super secret cis550',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
  extended: true
}));

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_S3_BUCKET,
    region: 'us-east-1',
    key: (req, file, cb) => {
      cb(null, getDateTime() + '_' + file.originalname)
    }
  })
});

module.exports = app;

// Bootstrap models
fs.readdirSync(MongoDB)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(MongoDB, file)));

const User = mongoose.model('User')
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const File = mongoose.model('File')
const InvertedIndex = mongoose.model('InvertedIndex')

mongoose.connect(MONGO_URL);

const mongodb = mongoose.connection;

mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongodb.once('open', () => {
	console.log('Connected to', MONGO_URL);
});

const extractorModule = require('./old/extractor.js');

const linkerModule = require('./old/linker.js');


app.get('/', (req, res) => {
  res.render('index', { title: 'CIS550 Datalake', user: req.user });
});

app.get('/register', (req, res) => {
  res.render('register', { });
})

app.post('/register', (req, res) => {

  User.register(new User({
    first: req.body.first,
    last: req.body.last,
    username: req.body.username,
    email: req.body.email
  }), req.body.password, (err, account) => {
    if (err) {
      console.log(err);
      return res.render('register', { user: user });
    }

    console.log(account);

    passport.authenticate('local')(req, res, () => {
      res.redirect('/');
    })
  })
})

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/file', upload.single('file'), (req, res, next) => {
  
  const filePromise = File.create({ 
    key: req.file.key,
    url: req.file.location,
    user_id: req.user._id
  });

  filePromise.then((doc) => {
    const connection = createRawMySQLConnection();
    const extractor = new extractorModule.Extractor();

    connection.connect();

    extractor.initConnection(connection);
    extractor.addFile(req.file.location, AWS_S3_BUCKET, req.file.key, doc._id);

  });

  res.render('index', { title: 'CIS550 Datalake', message: 'File uploaded!', user: req.user });  
});

app.post('/search', (req, res) => {
  
  const keywords = R.split(',', req.body.keywords);

  if (R.length(keywords) > 2) {
    res.render('index', { title: 'CIS550 Datalake', message: 'Please only enter one or two keywords!', user: req.user });  
  }

  var linkerModule = require('./old/linker.js');
  var linker = new linkerModule.Linker();
 
  linker.searchQuery(keywords, function(result) {

    var searchEngineModule = require('./old/SearchEngine/SearchEngine.js');
    var searchEngine = new searchEngineModule.Search();
    //console.log(result);

    searchEngine.StartSearch(result, function(searchResult){
      //console.log(searchResult);

      var nodes = [];
      var edges = [];
      for(var i=0;i<1;i++)
      {
          for(var j=0;j<searchResult[i].length;j++)
          {
              nodes.push({id: searchResult[i][j]["vertex_id"],
                          label: searchResult[i][j]["value"]});
              if(j != 0)
              {
                  edges.push({from: searchResult[i][j-1]["vertex_id"],
                              to: searchResult[i][j]["vertex_id"]});
              }
          }
      }

      const data = {
        nodes: nodes,
        edges: edges
      }

      res.render('search', {query: query, data: data});
    });
  });
})

MySQL.sequelize.sync().then(() => {
  app.listen(APP_PORT, () => {
    console.log('CIS550 Final Project started on port', APP_PORT);
  })
}, (err) => {
	console.log(err);
})
