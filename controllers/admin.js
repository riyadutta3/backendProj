const fileHelper = require('../util/file');
const { validationResult } = require('express-validator'); //importing validationResult function from express-validator

const Book = require('../models/book');

const ITEMS_PER_PAGE = 2;

exports.getAddBook = (req,res,next)=>{
    //res.sendFile(path.join(__dirname,'..','views','add-product.html')); 
        
    if(!req.session.isLoggedIn){
      return res.redirect('/login');
    }
    res.render('admin/edit-book', {  //object which will hold the data which we will pass into the template..
          pageTitle: 'Add Book',
          path: '/admin/add-book',
          editing: false,
          hasError: false,
          errorMessage: null,
          validationErrors: []
        });     
};

exports.postAddBook = (req,res,next)=>{ 
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const genre = req.body.genre;
    const description = req.body.description;
    // console.log(imageUrl);
    // console.log(errors.array());

    if(!image){
      return res.status(422).render('admin/edit-book', { 
        pageTitle: 'Add Book',
        path: '/admin/add-book',
        editing : false,
        hasError: true,
        book: {
          title: title,
          price: price,
          genre: genre, 
          description: description
        },
        errorMessage: 'Attached file is not an image.',
        validationErrors: []
      }); 
    }
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors.array());
      return res.status(422).render('admin/edit-book', { 
        pageTitle: 'Add Book',
        path: '/admin/add-book',
        editing : false,
        hasError: true,
        book: {
          title: title,
          price:price, 
          genre: genre,
          description:description
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }

    const imageUrl = image.path;

    const book = new Book({
      title: title,
      price:price, 
      description:description, 
      genre: genre,
      imageUrl:imageUrl,
      userId: req.user
    }) //mapping
    book.save() //before in mongodb this save method was defined by us, but here in mongoose it is already defined..
    .then(result => {
      console.log('CREATED BOOK');
      return res.redirect('/admin/books');
    })
    .catch(err => 
      {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }); //creates creates a new element based on that model and immediately saves it to the database..
};

exports.getEditBook = (req,res,next)=>{
      const editMode = req.query.edit;
      if(!editMode){
        return res.redirect('/');
      }

      const bookId = req.params.bookId;
      Book.findById(bookId)
      .then(book => {
        if(!book){
          return res.redirect('/');
        }
        res.render('admin/edit-book', { 
          pageTitle: 'Edit Book',
          path: '/admin/edit-book',
          editing : editMode,
          hasError: false,
          book: book,
          errorMessage: null,
          validationErrors: []
        }); })
        .catch(err => {
          const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        });        
};

exports.postEditBook = (req,res,next)=>{
      const bookId = req.body.bookId;
      const updatedTitle = req.body.title;
      const updatedPrice = req.body.price;
      const updatedGenre = req.body.genre;
      const image = req.file;
      const updatedDesc = req.body.description;

      const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(422).render('admin/edit-book', { 
        pageTitle: 'Add Book',
        path: '/admin/edit-book',
        editing : true,
        hasError: true,
        book: {
          title: updatedTitle,
          price: updatedPrice, 
          description: updatedDesc, 
          genre: updatedGenre,
          _id: bookId
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }
      
      Book.findBybookId()
      .then(book => {
        if(book.userId.toString() !== req.user._id.toString())
        {
          res.redirect('/');
        }
        book.title = updatedTitle;
        book.price = updatedPrice;
        book.description = updatedDesc;
        book.genre = updatedGenre;
        if(image){
          fileHelper.deleteFile(book.imageUrl);
          book.imageUrl = image.path;
        }
        return book.save() .then(result => {
          console.log('UPDATED BOOK!!');
          res.redirect('/admin/books');
        })
      }
      )
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};

exports.getBooks = (req,res,next)=>{
  const page = +req.query.page || 1;
  let totalItems;
  
  Book.find({userId: req.user._id}).countDocuments().then(numBooks => {
    totalItems = numBooks;
    return Book.find({userId: req.user._id})
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(books => {
    res.render('admin/books', {
      books: books,
      pageTitle: 'Admin Books',
      path: '/admin/books',
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
  // Product.find({userId: req.user._id})//filtering products on admin products page using user id, so the products added by that user will be displayed only and can be edited
  // // .select('title price -_id') //here using select we can select only the required fields from the document, using - sign we can avoid the mentioned field..
  // // .populate('userId','name email') //populate allow us to tell mongoose to populate a certain field with all the detail information..
  // .then(products => {
  //   console.log(products);
  //   res.render('admin/products', {
  //   prods: products,
  //   pageTitle: 'Admin Products',
  //   path: '/admin/products'
  // });
  // })
  // .catch(err => {
  //   const error = new Error(err);
  //   error.httpStatusCode = 500;
  //   return next(error);
  // });
};

exports.deleteBook = (req,res,next)=>{
      const bookId = req.params.bookId;

      Book.findById(bookId)
      .then(book => {
        if(!book)
        {
          return next(new Error('Book not found.'));
        }
        fileHelper.deleteFile(book.imageUrl);
        return Book.deleteOne({_id: bookId, userId: req.user._id}) //this removes the document with given prodId
      })
      .then(() => {
      console.log('DESTROYED PRODUCT!!');
      res.status(200).json({message: 'Success!'});
      })
      .catch(err => {
        res.status(500).json({message: 'Deleting book failed.'});
      });   
}