const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db; //_ is only to indicate that the variable will be used only internally in this file u can drop _ as well..

const mongoConnect = (callback) => {
MongoClient.connect('mongodb+srv://riya001:mongodbnode@cluster0.oz44q7i.mongodb.net/shop')
.then(client => {
    console.log('CONNECTED');
    _db = client.db(); //providing access to the db..
    callback(); //function that'll get executed when the client gets connected..
})
.catch(err => {
    console.log(err);
    throw err;
});
};

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'No database found!!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
