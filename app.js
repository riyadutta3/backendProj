//go to backendComments for code with comments..

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const db = require('./util/database');

const app = express(); //creating object of express

app.set('view engine','ejs'); //allows you set global conf. value, allows us to set any value globally on our express application..
app.set('views','views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');



//bodyParser package
app.use(bodyParser.urlencoded({extended: false})); //to parse body of req.. (not to parse files..)
app.use(express.static(path.join(__dirname,'public')));//folder that you want to access statically..
//it'll take any request that tries to find some file, it automatically forward it to public path..


//path filtering.. here only paths starting with admin will go to the adminRoutes file
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

app.listen(3000); 