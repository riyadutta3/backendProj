const express = require('express');

const router = express.Router();

const path = require('path');

const adminController = require('../controllers/admin');



//here in this file /admin part is not checker just /add-product is checked..
router.get('/add-product',adminController.getAddProduct); //we are just passing the ref to the function, so don't write () after function name..
router.get('/products',adminController.getProducts);

// /admin/add-product =>POST
router.post('/add-product',adminController.postAddProduct);
router.get('/edit-product/:productId',adminController.getEditProduct);
router.post('/edit-product',adminController.postEditProduct);
router.post('/delete-product',adminController.postDeleteProduct);


module.exports = router;