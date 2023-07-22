const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const path = require('path');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');


//here in this file /admin part is not checker just /add-product is checked..
router.get('/add-book',isAuth, adminController.getAddBook); //we are just passing the ref to the function, so don't write () after function name..
router.get('/books',isAuth, adminController.getBooks);

// // /admin/add-product =>POST
router.post('/add-book',[
    body('title')
    .isString()
    .isLength({min : 3})
    .trim(),
    body('price')
    .isFloat(),
    body('description')
    .isLength({min : 5, max : 200})
    .trim()
    ],
    isAuth, 
    adminController.postAddBook);


router.get('/edit-book/:bookId',isAuth, adminController.getEditBook);


router.post('/edit-book',[
    body('title')
    .isString()
    .isLength({min : 3})
    .trim(),
    body('price')
    .isFloat()
    .trim(),
    body('description')
    .isLength({min : 5, max : 200})
    .trim()
    ],isAuth, adminController.postEditBook);


router.delete('/book/:bookId',isAuth, adminController.deleteBook);

module.exports = router;

