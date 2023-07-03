//go to backendComments for code with comments..

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


const app = express(); //creating object of express

app.set('view engine','ejs'); //allows you set global conf. value, allows us to set any value globally on our express application..
app.set('views','views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');



//bodyParser package
app.use(bodyParser.urlencoded({extended: false})); //to parse body of req.. (not to parse files..)
app.use(express.static(path.join(__dirname,'public')));//folder that you want to access statically..
//it'll take any request that tries to find some file, it automatically forward it to public path..
app.use((req,res,next) => {
    User.findByPk(2)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

//path filtering.. here only paths starting with admin will go to the adminRoutes file
app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product); //optional
User.hasOne(Cart);
Cart.belongsTo(User); //optional
Cart.belongsToMany(Product, { through: CartItem});
Product.belongsToMany(Cart, { through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through : OrderItem});

// .sync({force: true}) //now here sync will not only create tables but also define their relations as we define them..
//we've already created the  products table, so it'll not override, we can ensure that it'll by setting force: true
//here we are removing it because we don't want it to create new table every time and lost old data..
//npm start runs this code..
sequelize.sync()
.then(result => { 
    return User.findByPk(2);
    // console.log(result);
})
.then(user => {
    if(!user){
        return User.create({
            name: 'Max',
            email: 'dummy@gmail.com'
        })
    }
    return user;
})
.then(user => {
    // console.log(user);
    return user.createCart();
})
.then(cart => {
    app.listen(3000);
}
)
.catch(err => {
    console.log(err);
}); //it sync your models to the database, by creating the apt. tables and relations..

