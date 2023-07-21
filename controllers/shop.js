const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51NVQmASHF2bI8nAsEUu2hgjxaLbUbdDI82aZek6juQ8i4pJ9IqC9AHmLHg74Nbsmsew89vWVliMvdKWUg6wjPlGF00COwCIFVa');
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;
//with this syntax you can add mutiple exports in one file..

exports.getProducts = (req,res,next)=>{
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page>1,
      nextPage: page+1,
      previousPage: page-1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
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
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

// exports.getIndex = (req,res,next)=>{ //for index page...
//   const page = +req.query.page || 1;
//   let totalItems;

//   Product.find().countDocuments().then(numProducts => {
//     totalItems = numProducts;
//     return Product.find()
//     .skip((page - 1) * ITEMS_PER_PAGE)
//     .limit(ITEMS_PER_PAGE);
//   })
//   .then(products => {
//     res.render('shop/index', {
//       prods: products,
//       pageTitle: 'Shop',
//       path: '/',
//       currentPage: page,
//       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
//       hasPrevPage: page>1,
//       nextPage: page+1,
//       previousPage: page-1,
//       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
//     });
//   })
//   .catch(err => {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     return next(error);
//   });
// };

exports.getFiction = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find({genre:'Fiction'}).countDocuments().then(numProducts => {
    totalItems = numProducts;
    return Product.find({genre:'Fiction'})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page>1,
      nextPage: page+1,
      previousPage: page-1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getNonFiction = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find({genre:'Non-Fiction'}).countDocuments().then(numProducts => {
    totalItems = numProducts;
    return Product.find({genre:'Non-Fiction'})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page>1,
      nextPage: page+1,
      previousPage: page-1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getCart = (req, res, next) =>{
  req.user
  .populate('cart.items.productId') //we already have items array in cart, here we are populating products with all the info available.. 
  .then(user => {
    console.log('get cart');
    // console.log(user.cart.items);
      const products = user.cart.items;
      res.render('shop/cart', {
              pageTitle: 'Your Cart',
              path: '/cart',
              products: products
            });
  })
  .catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    console.log(err);
  });
};

exports.postCart = (req,res,next) =>{
    const prodId = req.body.productId;
    console.log('post cart');
    Product.findById(prodId)
    .then(product => {
     return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next)=>{
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    console.log(err);
  });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  // console.log('get checkout');
  req.user
  .populate('cart.items.productId') //we already have items array in cart, here we are populating products with all the info available.. 
  .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
        console.log(p.productId);
      });
      return stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ['card'],
        line_items: products.map(p =>{
          return {
            price_data: {
              product_data: {
                // product: p.productId._id,
                name: p.productId.title,
                description: p.productId.description,
              },
              unit_amount: p.productId.price * 100,
              currency: 'inr',
            } ,
            quantity: p.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
  })
  .then(session=> {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
      products: products,
      totalSum: total,
      sessionId: session.id
    });
  })
  .catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    console.log(err);
  });
}

exports.getCheckoutSuccess = (req, res, next) => {
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
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
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
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order => {
    if(!order){
      return next(new Error('No order found.'));
    }

    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('Unauthorized!'));
    }

   const invoiceName = 'invoice-' + orderId + '.pdf';
   const invoicePath = path.join('data', 'invoices', invoiceName);

   const pdfDoc = new PDFDocument();
   pdfDoc.pipe(fs.createWriteStream(invoicePath));
   res.setHeader('Content-Type','application/pdf');
   res.setHeader('Content-Disposition',
   'inline; filename = "'+ invoiceName +'"');
   pdfDoc.pipe(res);

   pdfDoc.fontSize(26).text('Invoice',{
    underline: true
   });

   pdfDoc.text('---------------------------');
   
   let totalPrice = 0;

   order.products.forEach(prod => {
    totalPrice += prod.quantity * prod.productData.price;
    pdfDoc
    .fontSize(14)
    .text(
      prod.productData.title +
      ' -' +
       prod.quantity +
      ' x ' +
       ' Rs.' +
      prod.productData.price);
   });

   pdfDoc.text('---------------------------');


   pdfDoc
   .fontSize(20)
   .text('total Price: Rs.'+ totalPrice);

   pdfDoc.end();
   // console.log(invoiceName);
   // var data = fs.readFileSync(invoicePath);
   //   res.contentType("application/pdf");
   //   res.setHeader('Content-Disposition','inline; filename = "'+ invoiceName +'"');
   //   res.send(data);

    // const file = fs.createReadStream(invoicePath);
    // res.contentType("application/pdf");
    // res.setHeader('Content-Disposition','inline; filename = "'+ invoiceName +'"');
    // file.pipe(res);
  })
  .catch(err => next(err));
};

// exports.getCheckout = (req,res,next)=>{
//   res.render('shop/checkout',{
//     path: '/checkout',
//     pageTitile: 'Checkout'
//   });
// }