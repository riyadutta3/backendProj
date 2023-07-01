const fs = require('fs');

const requestHandler = (req,res)=>{
    const url=req.url;
    const method=req.method;
    if(url==='/'){
        res.write('<html>');
        res.write('<head><title>Enter message</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        return res.end(); //this is to return from function and not response..
    }

    
    if(url==='/message' && method==='POST'){
        const body=[]; //this simply means we cannot reassign a new value, be we can push values to it..
        req.on('data',(chunk)=>{
            console.log(chunk);
            body.push(chunk);
        }); //event listener, data event will be fired everytime a new chunk is ready to be read..
        //and the function that'll run for every chunk of data that is read..
        return req.on('end',()=>{
            const parsedBody = Buffer.concat(body).toString();  //we are storing everything that is read into a new buffer called parsedBody..
            // console.log(parsedBody);
            const message = parsedBody.split('=')[1];
            //fs.writeFileSync('message.txt',message);
            fs.writeFile('message.txt',message,(err)=>{  //this code will be executed only once we are done writting into the file..
                res.statusCode=302; //302 is for redirection..
                res.setHeader('Location','/');
                // return res.end();
                res.end();
            });
            
        });//this will be fired once it's done parsing the incoming req data..    
    }
    //the following code can run even before the code written above in end, because it contains callback function
//which will be executed sometimes in the future..hence we write return before req.end()..
res.setHeader('Content-Type','text/html');
res.write('<html>');
res.write('<head><title>My First Page</title></head>');
res.write('<body><h1>Hello from my Node.js Server</h1></body>');
res.write('</html>');
res.end();
};

// module.exports = requestHandler;

// module.exports = {
//     handler : requestHandler,
//     text : "wowwwwwwwwwwww"
// };

// module.exports.handler = requestHandler;
// module.exports.text = "wowwwwwwwwwwww" ;

exports.handler = requestHandler;
exports.text = "wowwwwwwwwwwww" ;

//writeFileSync method blocks the execution of the code, till file is created
//in case files are really big, if we'll block the code execution, the new incoming req will not be entertained
//plus the next lines of code too will not get executed..
//it's preferred to use writeFile instead.