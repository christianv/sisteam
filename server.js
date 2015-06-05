var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

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
  console.log(pictures.length);

  return pictures;
};

var getPictures = function(res) {
  request({
    url: 'http://sisproject.berkeley.edu/team'
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var pictures = parsePictures(body);
      res.send({
        pictures: pictures
      });
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
  getPictures(res);
});

var port = process.env.PORT || 3100;
app.listen(port);
