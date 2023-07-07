const Product = require('../models/product');
//with this syntax you can add mutiple exports in one file..

exports.getProducts = (req,res,next)=>{
  Product.fetchAll()
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All products',
      path: '/products'
    });
  })
  .catch(err => console.log(err));
}

exports.getProduct = (req,res,next)=>{
  const prodId = req.params.productId;
  // Product.findAll({where: {id: prodId}}) //findAll aways give you an array..
  // .then(products => {
  //   res.render('shop/product-detail',
  //   {product: products[0],
  //    pageTitle: products[0].title,
  //    path: '/products'
  //  });
  // })
  // .catch(err => console.log(err));

  Product.findById(prodId).then(product =>{ //array destructuring
    res.render('shop/product-detail',
    {product: product,
     pageTitle: product.title,
     path: '/products'
   });
  }).catch(err => console.log(err));
}

exports.getIndex = (req,res,next)=>{ //for index page...
  Product.fetchAll()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) =>{
  req.user.getCart()
  .then(products => {
      res.render('shop/cart', {
              pageTitle: 'Your Cart',
              path: '/cart',
              products: products
            });
  })
  .catch(err => console.log(err));
};

exports.postCart = (req,res,next) =>{
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
     return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  req.user
  .deleteItemFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
  .addOrder()
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req,res,next)=>{ 
  req.user.getOrders()
  .then(orders => {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders: orders
    });
  })
  .catch(err => console.log(err));
  
}

exports.getCheckout = (req,res,next)=>{
  res.render('shop/checkout',{
    path: '/checkout',
    pageTitile: 'Checkout'
  });
}