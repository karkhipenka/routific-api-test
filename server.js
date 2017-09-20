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
  url: '',
  json: {},
  headers: {
    'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWJmZDRmMmQ5OGI1MGQzMTZkYTI0MTkiLCJpYXQiOjE1MDU3NDQxMTR9.BGDRMCgYTLiUU6LgMkjbY445NNldI0cLVyJ1126Bb5M'
  }
};

//chapter-one-case-one.json'

function getUrl(isVrpEndpoint)
{
  return isVrpEndpoint ? 'https://api.routific.com/v1/vrp' : 'https://api.routific.com/v1/pdp';
}

function RenderResults(req, res, filename, isVrpEndpoint) {
  var data = require(path.join(__dirname + '/data/' + filename));

  options.url = getUrl(isVrpEndpoint);
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
      var errorResult = { errorCode: response.statusCode, errorMessage: body.error };
      res.render(path.join(__dirname + '/pages/error.html'), errorResult);      
    }
  }
  request.post(options, callback);
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/index.html'));
});

app.get('/sandbox', function (req, res) {
  var caseResult = { sourceJson: '', resultJson: '' };
  res.render(path.join(__dirname + '/pages/sandbox.html'), caseResult);
});

app.post('/sandbox', function (req, res) {
  var isVrpEndpoint = req.body.isVrpEndpoint === 'true';

  options.url = getUrl(isVrpEndpoint);

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

app.get('/quickstart-example', function (req, res) {
  RenderResults(req, res, 'quickstart-example.json');
});

app.get('/case-result/one', function (req, res) {
  RenderResults(req, res, 'chapter-one-case-one.json');
});

app.listen(process.env.PORT || 3000)

console.log("Running at Port 3000");