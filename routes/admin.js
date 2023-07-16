const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const path = require('path');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');


//here in this file /admin part is not checker just /add-product is checked..
router.get('/add-product',isAuth, adminController.getAddProduct); //we are just passing the ref to the function, so don't write () after function name..
router.get('/products',isAuth, adminController.getProducts);

// // /admin/add-product =>POST
router.post('/add-product',[
    body('title')
    .isString()
    .isLength({min : 3})
    .trim(),
    body('imageUrl')
    .isURL(),
    body('price')
    .isFloat()
    .trim(),
    body('description')
    .isLength({min : 5, max : 200})
    .trim()
    ],
    isAuth, 
    adminController.postAddProduct);


router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);


router.post('/edit-product',[
    body('title')
    .isString()
    .isLength({min : 3})
    .trim(),
    body('imageUrl')
    .isURL(),
    body('price')
    .isFloat()
    .trim(),
    body('description')
    .isLength({min : 5, max : 200})
    .trim()
    ],isAuth, adminController.postEditProduct);


router.post('/delete-product',isAuth, adminController.postDeleteProduct);


module.exports = router;