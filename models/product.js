const mongodb = require('mongodb');

const getDb = require('../util/database').getDb; //calling getDb function to interact with the database...

class Product{
  constructor(title, price, description, imageUrl, id){
    this.title=title;
    this.price=price;
    this.description=description;
    this.imageUrl=imageUrl;
    this._id= id ? new mongodb.ObjectId(id) : null; //to check if the id already exists or not
  }

  save(){
    const db = getDb(); //getDb simply returns that database instance we connected to..
    let dbOp;
    if(this._id){
      //update product
      dbOp = db.collection('products').updateOne({_id: this._id }, {$set : this});
    }
    else{
      dbOp = db
      .collection('products')
      .insertOne(this) ;
    }
    return dbOp
    .then(result => {
      console.log(result);
    })
    .catch(err => console.log(err)); //this js object will be converted into json by mongodb
  }

  static fetchAll(){
    const db = getDb();
    return db
    .collection('products')
    .find()
    .toArray()
    .then(products => {
      console.log(products);
      return products;
    })
    .catch(err => console.log(err)); //find returns a cursor, that is a mongodb object which allows us to go through our documents step by step..
  }

  static findById(prodId)
  {
    const ID = prodId.trim();
    console.log(ID);
    const db = getDb();
    return db.collection('products')
    .find({_id :new mongodb.ObjectId(ID)}) //mongodb stores id as _id
    .next() //to get the next document returned by find..
    .then(product => {
      console.log(product);
      return product;
    })
    .catch(err => console.log(err)); 
  }

  static deleteById(prodId){
    const db = getDb(); //getting connection to the database..
    return db
    .collection('products')
    .deleteOne({_id : new mongodb.ObjectId(prodId)})
    .then(result => {
      console.log('Deleted');
    })
    .catch(err => console.log(err)); //specifying a filter inside deleteOne..
  }

}


module.exports = Product;