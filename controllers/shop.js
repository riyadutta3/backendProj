const Product = require('../models/product');
const Order = require('../models/order');
//with this syntax you can add mutiple exports in one file..

exports.getProducts = (req,res,next)=>{
  Product.find() //find doesn't give the cursor, it simply gives all the products..
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
  //mongoose has a find by id method.., moreover you can even pass a string to find by id and mongoose will automatically convert it to object id..
  Product.findById(prodId).then(product =>{ //array destructuring
    res.render('shop/product-detail',
    {product: product,
     pageTitle: product.title,
     path: '/products'
   });
  }).catch(err => console.log(err));
}

exports.getIndex = (req,res,next)=>{ //for index page...
  Product.find()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      csrfToken: req.csrfToken()
    });
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) =>{
  req.user
  .populate('cart.items.productId') //we already have items array in cart, here we are populating products with all the info available.. 
  .then(user => {
    console.log(user.cart.items);
      const products = user.cart.items;
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
  .removeFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
  .populate('cart.items.productId') //we already have items array in cart, here we are populating products with all the info available.. 
  .then(user => {
      const products = user.cart.items.map(i => {
        return {quantity: i.quantity, productData: {...i.productId._doc}};
      });
  const order = new Order({
    user: {
      email: req.user.email,
      userId: req.user
    },
   products: products
  });
  return order.save();
})
  .then(result => {
    return req.user.clearCart();
  })
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
}

exports.getOrders = (req,res,next)=>{ 
  Order.find({'user.userId': req.user._id})
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