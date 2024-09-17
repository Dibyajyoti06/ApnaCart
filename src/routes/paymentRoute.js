const express = require('express');
const {
  checkout,
  paymentVerification,
} = require('../controller/paymentController');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const authUser = require('../middleware/authUser');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
dotenv.config();

router.route('/checkout').post(checkout);
router
  .route('/paymentverification', bodyParser.raw({ type: 'application/json' }))
  .post(paymentVerification);
router.get('/getPreviousOrders', authUser, async (req, res) => {
  try {
    const data = await Payment.find({ user: req.user_id }).sort({
      createdAt: -1,
    });
    res.send(data);
  } catch (error) {
    res.status(500).send('Something went wrong');
  }
});
module.exports = router;
