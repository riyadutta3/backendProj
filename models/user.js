const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      cart: {
        items: [{productId: {type: Schema.Types.ObjectId, ref: 'Product',required: true},
                 quantity: {type: Number, required: true}}]
      }
});

userSchema.methods.addToCart = function(product){  //methods key allow you to add your own methods..
    const cartProductIndex = this.cart.items.findIndex(cp => {  //js will run this function for every item in the array
                    return cp.productId.toString() === product._id.toString();
                });
        
                let newQuantity = 1;
                const updatedCartItems = [...this.cart.items];
                
                if(cartProductIndex >= 0){
                    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
                    updatedCartItems[cartProductIndex].quantity = newQuantity;
                }else{
                    updatedCartItems.push({productId: product._id,quantity: newQuantity });
                }
                
                const updatedCart = {
                    items: updatedCartItems
                }; //adding quantity property to product object..
                
                this.cart = updatedCart;
                return this.save();
}

userSchema.methods.removeFromCart = function(productId){
    const updatedCartItems = this.cart.items.filter(item =>{
                    return item.productId.toString() !== productId.toString();
        });

    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart = {items: []};
    return this.save();
};

module.exports = mongoose.model('User', userSchema);


// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;

// class User {
//     constructor(username, email, cart, id){
//         this.name=username;
//         this.email=email;
//         this.cart=cart; //{items: []}
//         this._id=id;
//     }

//     save(){
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product){
//         const cartProductIndex = this.cart.items.findIndex(cp => {  //js will run this function for every item in the array
//             return cp.productId.toString() === product._id.toString();
//         });

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
        
//         if(cartProductIndex >= 0){
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }else{
//             updatedCartItems.push({productId: new ObjectId(product._id),quantity: newQuantity });
//         }
        
//         const updatedCart = {
//             items: updatedCartItems
//         }; //adding quantity property to product object..
//         const db = getDb();
//         return db
//         .collection('users')
//         .updateOne({_id: new ObjectId(this._id)}
//         ,{$set: {cart: updatedCart}});
//     }

//     getCart()
//     {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId; //mapping js object having id and quantity to a js array that contains id only..
//         });
//         return db
//         .collection('products')
//         .find({_id: {$in : productIds}})//gives all elements where id is one of the id's mentioned in the productIds array.. 
//         .toArray()
//         .then(products => {
//             return products.map(p => {
//                 return {...p,
//                      quantity: this.cart.items.find(i => {
//                     return i.productId.toString() === p._id.toString();
//                 }).quantity
//             };
//             })
//         }); 
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item =>{
//             return item.productId.toString() !== productId.toString();
//         }); //deleting items

//         const db = getDb();
//         return db
//         .collection('users')
//         .updateOne({_id: new ObjectId(this._id)}
//         ,{$set: {cart: {items: updatedCartItems}}}); //updating items of cart to be the one's which aren't deleted..

//     }

//     addOrder(){
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.name
//                 }
//             }
//             return db
//         .collection('orders')
//         .insertOne(order)
//         })
//         .then(result => {
//             {items: []};
//             return db
//         .collection('users')
//         .updateOne({_id: new ObjectId(this._id)}
//         ,{$set: {cart: {items: []}}}) 
//         });
//     }

//     getOrders(){
//         const db = getDb();
//         return db
//         .collection('orders')
//         .find({'user._id': new ObjectId(this._id)})
//         .toArray();
//     }

//     static findById(userId){
//         const db = getDb();
//         return db
//         .collection('users')
//         .findOne({_id : new ObjectId(userId)})
//         .then(user => {
//             console.log(user);
//             return user;
//         })
//         .catch(err => console.log(err)); //new ObjectId(id) converts id from string to the object form...
//     }
// }

// module.exports = User;