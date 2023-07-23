const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const Book = require('../models/book');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;
//with this syntax you can add mutiple exports in one file..

exports.getBooks = (req,res,next)=>{
  const page = +req.query.page || 1;
  let totalItems;

  Book.find().countDocuments().then(numBooks => {
    totalItems = numBooks;
    // console.log(totalItems);
    return Book.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(books => {
    res.render('shop/book-list', {
      books: books,
      pageTitle: 'Books',
      path: '/books',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page>1,
      nextPage: page+1,
      previousPage: page-1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    console.log(err);
  });
}

exports.getBook = (req,res,next)=>{
  const bookId = req.params.bookId;
  
  //mongoose has a find by id method.., moreover you can even pass a string to find by id and mongoose will automatically convert it to object id..
  Book.findById(bookId).then(book =>{ //array destructuring
    res.render('shop/book-detail',
    {book: book,
     pageTitle: book.title,
     path: '/books'
   });
  }).catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    console.log(err);
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

    Book.find({genre:'Fiction'}).countDocuments().then(numBooks => {
    totalItems = numBooks;
    return Book.find({genre:'Fiction'})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(books => {
    res.render('shop/book-list', {
      books: books,
      pageTitle: 'Fiction',
      path: '/fiction',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page>1,
      nextPage: page+1,
      previousPage: page-1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    console.log(err);
  });
}

exports.getNonFiction = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Book.find({genre:'Non-Fiction'}).countDocuments().then(numBooks => {
    totalItems = numBooks;
    return Book.find({genre:'Non-Fiction'})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(books => {
    res.render('shop/book-list', {
      books: books,
      pageTitle: 'Non-Fiction',
      path: '/nonfiction',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPrevPage: page>1,
      nextPage: page+1,
      previousPage: page-1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    // const error = new Error(err);
    // error.httpStatusCode = 500;
    // return next(error);
    console.log(err);
  });
}

exports.getCart = (req, res, next) =>{
  req.user
  .populate('cart.items.bookId') //we already have items array in cart, here we are populating products with all the info available.. 
  .then(user => {
    console.log('get cart');
    // console.log(user.cart.items);
      const books = user.cart.items;
      res.render('shop/cart', {
              pageTitle: 'Your Cart',
              path: '/cart',
              books: books
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
    const bookId = req.body.bookId;
    console.log('post cart');
    Book.findById(bookId)
    .then(book => {
     return req.user.addToCart(book);
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

exports.postCartDeleteBook = (req, res, next)=>{
  const bookId = req.body.bookId;
  req.user
  .removeFromCart(bookId)
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
  let books;
  let total = 0;
  // console.log('get checkout');
  req.user
  .populate('cart.items.bookId') //we already have items array in cart, here we are populating products with all the info available.. 
  .then(user => {
      books = user.cart.items;
      total = 0;
      books.forEach(b => {
        total += b.quantity * b.bookId.price;
        console.log(b.bookId);
      });
      return stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ['card'],
        line_items: books.map(b =>{
          return {
            price_data: {
              product_data: {
                // product: p.productId._id,
                name: b.bookId.title,
                description: b.bookId.description,
              },
              unit_amount: b.bookId.price * 100,
              currency: 'inr',
            } ,
            quantity: b.quantity
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
      books: books,
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
  .populate('cart.items.bookId') //we already have items array in cart, here we are populating products with all the info available.. 
  .then(user => {
      const books = user.cart.items.map(i => {
        return {quantity: i.quantity, bookData: {...i.bookId._doc}};
      });
  const order = new Order({
    user: {
      email: req.user.email,
      userId: req.user
    },
   books: books
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

   order.books.forEach(book => {
    totalPrice += book.quantity * book.bookData.price;
    pdfDoc
    .fontSize(14)
    .text(
      book.bookData.title +
      ' -' +
      book.quantity +
      ' x ' +
       ' Rs.' +
      book.bookData.price);
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
  }).catch(err => next(err));
}
