"use strict";

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
const dns = require('dns');
var URI = require('urijs');

var counter = 0;

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  console.log("Sucess");
  
  
//   var test = new url({original_url: "www.google.com", "short_url": "1"});
  
//   test.save(function (err, test) {
//     if (err) return console.error(err);
//     console.log("SAVED");
//   });
  
  // url.find(function (err, url) {
  //   if (err) return console.error(err);
  //   console.log(url);
  // })
});

var urlSchema = mongoose.Schema({
    original_url: String,
    short_url: Number
  });
  
var url = mongoose.model("url", urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/shorturl/:id", function(req,res) {
  
  var returnedUrl = url.findOne({ short_url: req.params.id }, function (err, data) {
    if (err) {
      res.json({error: "Error"});
      return;
    } else if (data == null) {
      res.json({error: "Invalid short url"});
    }
    console.log("returned Url: " + data.original_url);
    res.redirect(data.original_url);
  });
});

app.post("/api/shorturl/new", function(req, res) {
  var inputUrl = new URI(req.body.url);
  
  var isValidUrl = dns.lookup(inputUrl.hostname(), (err, address, family) => {
    if (err) {
      res.json({error:"invalid URL"});
      return;
    } else {
      var newUrl = new url({original_url: req.body.url, short_url: counter});
  
      newUrl.save(function (err, test) {
        if (err) return console.error(err);
        console.log("SAVED " + req.body.url + " " + counter);
      });

      res.json({original_url: req.body.url, short_url: counter});
      counter++;
    }
  });
  
});

var listener = app.listen(process.env.PORT || 3000 , function () {
   console.log('Your app is listening on port ' + listener.address().port);
});