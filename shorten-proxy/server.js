var http = require("http");
var app = require("./src/app");

var port = process.env.PORT || 9000;

var server = http.createServer(app);
server.listen(port, function () {
  console.log(`Server is running at http://localhost:${port}\n`);
});

server.on("error", function (error) {
  console.error("Error: Server failed to start!");
  console.error(error.message);
});
