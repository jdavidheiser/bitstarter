

var express = require('express');

var app = express.createServer(express.logger());

// If we set default text, we know that we didn't read the file correctly
var filebuffer = new Buffer("Default Text");
var fs = require('fs')
app.get('/', function(request, response) {
  fd = fs.open('index.html','r')
  fs.readSync(fd, filebuffer)
  response.send(filebuffer.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
