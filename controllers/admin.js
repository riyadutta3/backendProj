const Product = require('../models/product');

exports.getAddProduct = (req,res,next)=>{
    //res.sendFile(path.join(__dirname,'..','views','add-product.html')); 
        res.render('admin/edit-product', {  //object which will hold the data which we will pass into the template..
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          editing: false,
        });     
};

exports.postAddProduct = (req,res,next)=>{ 
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({
      title: title,
      price:price, 
      description:description, 
      imageUrl:imageUrl,
      userId: req.user._id
    }) //mapping
    product.save() //before in mongodb this save method was defined by us, but here in mongoose it is already defined..
    .then(result => {
      console.log('CREATED PRODUCT');
      return res.redirect('/admin/products');
    })
    .catch(err => console.log(err)); //creates creates a new element based on that model and immediately saves it to the database..
};

exports.getEditProduct = (req,res,next)=>{
      const editMode = req.query.edit;
      if(!editMode){
        return res.redirect('/');
      }

      const prodId = req.params.productId;
      Product.findById(prodId)
      .then(product => {
        if(!product){
          return res.redirect('/');
        }
        res.render('admin/edit-product', { 
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing : editMode,
          product: product
        }); })
        .catch(err => console.log(err));        
};

exports.postEditProduct = (req,res,next)=>{
      const prodId = req.body.productId;
      const updatedTitle = req.body.title;
      const updatedPrice = req.body.price;
      const updatedImageUrl = req.body.imageUrl;
      const updatedDesc = req.body.description;
      
      Product.findById(prodId).then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
        return product.save()
      }
      )
      .then(result => {
        console.log('UPDATED PRODUCT!!');
        res.redirect('/admin/products');
      })
      .catch(err => console.log(err));
};

exports.getProducts = (req,res,next)=>{
  Product.find()
  // .select('title price -_id') //here using select we can select only the required fields from the document, using - sign we can avoid the mentioned field..
  // .populate('userId','name email') //populate allow us to tell mongoose to populate a certain field with all the detail information..
  .then(products => {
    console.log(products);
    res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products'
  });
  })
  .catch(err => console.log(err));
};

exports.postDeleteProduct = (req,res,next)=>{
      const prodId = req.body.productId;
      Product.findByIdAndRemove(prodId) //this removes the document with given prodId
      .then(() => {
      console.log('DESTROYED PRODUCT!!');
      res.redirect('/admin/products');
      })
      .catch(err => console.log(err));
      
}