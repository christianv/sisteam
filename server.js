var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var dateFormat = require('dateformat');
var app = express();

var picturesCache;

var sendError = function(res, errorMessage) {
  res.send({
    'type': 'error',
    'message': errorMessage
  });
};

var parsePictures = function(body) {
  var $ = cheerio.load(body);

  var pictures = [];

  $('table[cellpadding="3"] td:has(img)').each(function(i, element) {
    var picture = {
      image: $('img', this).attr('src'),
      // Temp fix, we need this for Jocelyn Newman
      name: $('strong', this).text() || $('b', this).text(),
      title: $('a', this).text()
    };
    pictures.push(picture);
  });

  return pictures;
};

var sendPictures = function(res) {
  var now = new Date();
  res.send({
    devInfo: {
      date: dateFormat(now, 'isoDateTime')
    },
    pictures: picturesCache
  });
}

var getPictures = function(res) {
  var now = new Date();
  console.log(dateFormat(now, 'isoDateTime') + ' - Getting the pictures');
  request({
    url: 'http://sisproject.berkeley.edu/team'
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      picturesCache = parsePictures(body);
      if (res) {
        sendPictures(res);
      }
    }
  });
};

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);
app.get('/api/pictures', function(req, res){
  if (!picturesCache) {
    getPictures(res);
  } else {
    sendPictures(res);
  }
});

app.get('/', function(req, res){
  res.send({
    'api': 'http://sisteam.herokuapp.com/api/pictures'
  })
});

var port = process.env.PORT || 3100;
app.listen(port);


setInterval(getPictures, 10000);
