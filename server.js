var express = require("express");
var request = require('request');
var path = require("path");
var engines = require('consolidate');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', engines.mustache);

var options = {
  url: 'https://api.routific.com/v1/vrp',
  json: {},
  headers: {
    'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWJmZDRmMmQ5OGI1MGQzMTZkYTI0MTkiLCJpYXQiOjE1MDU3NDQxMTR9.BGDRMCgYTLiUU6LgMkjbY445NNldI0cLVyJ1126Bb5M'
  }
};

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/index.html'));
});

app.get('/sandbox', function (req, res) {
  var caseResult = { sourceJson: '', resultJson: '' };
  res.render(path.join(__dirname + '/pages/sandbox.html'), caseResult);
});

app.post('/sandbox', function (req, res) {
  var sourceObject = JSON.parse(req.body.sourceJsonTextArea);
  var sourceJson = JSON.stringify(sourceObject, null, 4);

  options.json = sourceObject;

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var resultJson = JSON.stringify(body, null, 4);
      var caseResult = { sourceJson: sourceJson, resultJson: resultJson };
      res.render(path.join(__dirname + '/pages/sandbox.html'), caseResult);
    }
    else {
      console.log(response.statusCode + ': ' + body.error);
      var errorResult = { errorCode: response.statusCode, errorMessage: body.error };
      res.render(path.join(__dirname + '/pages/error.html'), errorResult);
    }
  }
  request.post(options, callback);
});

app.get('/case-result/one', function (req, res) {
  var data = require(path.join(__dirname + '/data/chapter-one-case-one.json'));
  options.json = data;
  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var sourceJson = JSON.stringify(data, null, 4);
      var resultJson = JSON.stringify(body, null, 4);
      var caseResult = { sourceJson: sourceJson, resultJson: resultJson };
      res.render(path.join(__dirname + '/pages/case-result.html'), caseResult);
    }
    else {
      console.log(response.statusCode + ': ' + body.error);
    }
  }
  request.post(options, callback);
});

app.listen(3000); 

console.log("Running at Port 3000");