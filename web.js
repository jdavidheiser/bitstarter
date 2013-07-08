
 
var express = require('express');

var app = express.createServer(express.logger());

// If we set default text, we know that we didn't read the file correctly

app.get('/', function(request, response) {
  var fs = require('fs');
  buffer = fs.readFileSync('index.html');
  console.log(buffer.toString())
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

