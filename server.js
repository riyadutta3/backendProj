const  http = require('http'); //require() is simply a way to import files in the node js
//http is the file name, no need to write .js, as it gets added automatcally..
//for searching a local file use ./filename
//otherwise it'll seach for a global file

// http.createServer(); //it takes re listener as an arg, which is a function that'll execute for every incoming req..

const server = http.createServer((req,res)=>{  //createServer method returns a server
    // console.log(req.url, req.method,req.headers );
    // process.exit();
    //to quit manually, use ctrl+c
    res.setHeader('Content-Type','text/html'); //attaching header to our response
    //here we are telling that the response is text/html file..
    res.write('<html>');
    res.write('<head><title>My First Page</head>');
    res.write('<body><h1>Hello from my Node.js Server</h1></body>');
    res.write('</html>');
    res.end();
});

server.listen(3000); //because of this method,node js will not immediately exit but it'll keep on listening for incoming request 
//3000 -> port number on which you want to listen

// req.url -> /, whatever after localhost:3000
// req.method -> GET (default method used)
// req.headers -> meta data added to the incoming request


