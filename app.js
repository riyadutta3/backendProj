//go to backendComments for code with comments..

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://riya001:mongodbnode@cluster0.oz44q7i.mongodb.net/shop';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine','ejs'); 
app.set('views','views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false})); 
app.use(express.static(path.join(__dirname,'public')));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false, 
    store: store
})
); //secret is used to signing the hash, resave means session will not be saved on each reload, it'll be saved only on some change

app.use((req,res,next) => {
    if(!req.session.user){
        return next();
    }

    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err)); 
});


app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);


//mongoose manage connection behind the scene for us..
mongoose
.connect(MONGODB_URI)
.then(result => {   
    app.listen(3000);
})
.catch(err => {
    console.log(err)
});
