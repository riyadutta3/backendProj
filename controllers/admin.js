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
    req.user.createProduct({ //sequelize object
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    })
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
      req.user
      .getProducts( {where: {
        id: prodId} } )
      .then(products => {
        if(!products){
          return res.redirect('/');
        }
        res.render('admin/edit-product', { 
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing : editMode,
          product: products[0]
        }); })
        .catch(err => console.log(err));
      // Product.findById(prodId, product => {
      //   if(!product){
      //     return res.redirect('/');
      //   }
      //   res.render('admin/edit-product', { 
      //     pageTitle: 'Edit Product',
      //     path: '/admin/edit-product',
      //     editing : editMode,
      //     product: product
      //   }); 
      // })         
};

exports.postEditProduct = (req,res,next)=>{
      const prodId = req.body.productId;
      const updatedTitle = req.body.title;
      const updatedPrice = req.body.price;
      const updatedImageUrl = req.body.imageUrl;
      const updatedDesc = req.body.description;
      Product.findAll({where: {
        id: prodId
        }
      })
      .then(products => {
        products[0].title = updatedTitle;  //this will only update data locally and not in out database..
        products[0].price = updatedPrice;
        products[0].description = updatedDesc;
        products[0].imageUrl = updatedImageUrl;
        return products[0].save(); //save method saves data to the database..
      })
      .then(result => {
        console.log('UPDATED PRODUCT!!');
        res.redirect('/admin/products');
      })
      .catch(err => console.log(err));
};

exports.getProducts = (req,res,next)=>{
  req.user.getProducts()
  .then(products => {
    res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products'
  });
  })
  .catch(err => console.log(err));
    // Product.fetchAll(products =>{
    //     res.render('admin/products', {
    //       prods: products,
    //       pageTitle: 'Admin Products',
    //       path: '/admin/products'
    //     });
    //   });
};

exports.postDeleteProduct = (req,res,next)=>{
      const prodId = req.body.productId;
      Product.destroy({where: {
        id: prodId
        }
      }).then(result => {
        console.log('DESTROYED PRODUCT!!');
        res.redirect('/admin/products');
      })
      .catch(err => console.log(err));
      
}