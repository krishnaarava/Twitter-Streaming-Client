/**
 * Module dependencies.
 */

var express = require('express');
var sys = require('sys');

var TwitterNode = require('twitter-node').TwitterNode;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {locals: {
    title: 'Cricket Realtime ScoreBoard/ScoreCard'
  }});
});

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}

var nowjs = require('now');
var everyone = nowjs.initialize(app);

var twit = new TwitterNode({
  user: 'username', 
  password: 'password'
});

twit.track('#cricket');
twit.headers['User-Agent'] = 'nodejs-thing';

everyone.connected(function(){
  console.log("A client Joined");
});

everyone.disconnected(function(){
  console.log("A client Left");
});

twit.addListener('error', function(error) {
  console.log(error.message);
});

twit.addListener('tweet', function(tweet) {
 var str = "@" + tweet.user.screen_name + ": " + tweet.text;
 sendMsg(str);
 //console.log(str);
}).stream();

//** There seems to be error with Twitter-node and had to seperate function
sendMsg = function(message){
 if (typeof everyone.now.receiveMessage == 'function'){ 
  everyone.now.receiveMessage(message);
 }
};
