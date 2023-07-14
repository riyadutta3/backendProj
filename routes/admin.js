const express = require('express');

const router = express.Router();

const path = require('path');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');


//here in this file /admin part is not checker just /add-product is checked..
router.get('/add-product',isAuth, adminController.getAddProduct); //we are just passing the ref to the function, so don't write () after function name..
router.get('/products',isAuth, adminController.getProducts);

// // /admin/add-product =>POST
router.post('/add-product',isAuth, adminController.postAddProduct);
router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);
router.post('/edit-product',isAuth, adminController.postEditProduct);
router.post('/delete-product',isAuth, adminController.postDeleteProduct);


module.exports = router;