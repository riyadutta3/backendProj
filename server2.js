const http = require('http');
const routes = require('./routesTemp'); //routes is a local file
//it'll go to routes file and check what's there in module.exports
//routes file is locked, it can't be edited from outside.. it can only be imported..

// const server = http.createServer(routes);

const server = http.createServer(routes.handler);
console.log(routes.text);

server.listen(3000);
