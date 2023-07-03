const Product = require('../models/product');

//with this syntax you can add mutiple exports in one file..

exports.getProducts = (req,res,next)=>{
  Product.findAll()
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
  Product.findAll({where: {id: prodId}}) //findAll aways give you an array..
  .then(products => {
    res.render('shop/product-detail',
    {product: products[0],
     pageTitle: products[0].title,
     path: '/products'
   });
  })
  .catch(err => console.log(err));

  // Product.findById(prodId).then(([product])=>{ //array destructuring
  //   res.render('shop/product-detail',
  //   {product: product,
  //    pageTitle: product.title,
  //    path: '/products'
  //  });
  // }).catch(err => console.log(err));
}

exports.getIndex = (req,res,next)=>{ //for index page...
  Product.findAll()
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
  .then(cart => {
    return cart.getProducts() //added by sequelize
    .then(products => {
      res.render('shop/cart', {
              pageTitle: 'Your Cart',
              path: '/cart',
              products: products
            });
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
};

exports.postCart = (req,res,next) =>{
    const prodId = req.body.productId;
    let newQuantity = 1;
    let fetchedCart;
    req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where : {id : prodId}});
    })
    .then(products => {
      let product;
      if(products.length > 0){
        product = products[0];
      }
      if(product){
        const oldQuantity = product.cartItem.quantity; //sequelize provides us facility to access the in between table
        newQuantity = oldQuantity+1;
        return product;
      }
      return Product.findByPk(prodId)
      })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through : {quantity : newQuantity}
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  req.user
  .getCart()
  .then(cart => {
    return cart.getProducts({where : {id: prodId}});
  })
  .then(products => {
    const product = products[0];
    return product.cartItem.destroy(); //because i only want to delete items from in between table i.e. cart table and to the product table
  })
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
  .getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  })
  .then(products => {
    return req.user
    .createOrder()
    .then(order => {
      return order.addProducts(products.map(product => {
        product.orderItem = {quantity : product.cartItem.quantity};
        return product;
      }));
    }) 
  .catch(err => console.log(err));
  })
  .then(result => {
    return fetchedCart.setProducts(null); //to clean up cart after moving everything to orders table..
  })
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req,res,next)=>{ 
  req.user.getOrders({include: ['products']})
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