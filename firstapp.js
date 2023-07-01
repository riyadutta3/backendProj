const fs = require('fs'); //fs-> file system, imports file system functionalities into file

fs.writeFileSync('hello.txt','Hello from node js'); //this can't be done from browser, because we can't acess local file system from browser
