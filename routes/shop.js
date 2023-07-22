const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

// router.get('/',shopController.getIndex);
router.get('/books',shopController.getBooks);
router.get('/books/:bookId',  shopController.getBook); // : indicates that there can be anything after /products/......
router.get('/fiction', shopController.getFiction);
router.get('/nonfiction', shopController.getNonFiction);
router.get('/cart',isAuth, shopController.getCart);
router.post('/cart',isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteBook);
router.get('/checkout', isAuth, shopController.getCheckout);
router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess);
router.get('/checkout/cancel', shopController.getCheckout);
router.get('/orders',isAuth, shopController.getOrders);
router.get('/orders/:orderId',isAuth, shopController.getInvoice);
 
module.exports = router;