const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const authUser = require('../middleware/authUser');
const mongoose = require('mongoose');

// get all cart products
router.get('/fetchcart', authUser, async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user_id })
      .populate('productId', 'name price image rating type')
      .populate('user', 'firstName email');
    res.send(cart);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

//Another way
// router.get('/fetchcart', authUser, async (req, res) => {
//   try {
//     const cart = await Cart.aggregate([
//       {
//         $match: { user: mongoose.Types.ObjectId(req.user_id) }, // Ensure this matches the correct user
//       },
//       {
//         $lookup: {
//           from: 'users', // Ensure 'users' is the correct collection name (case-sensitive)
//           localField: 'user',
//           foreignField: '_id',
//           as: 'userDetails',
//         },
//       },
//       {
//         $unwind: '$userDetails', // Handle cases where there might not be a match
//       },
//       {
//         $lookup: {
//           from: 'products', // Ensure 'products' is the correct collection name
//           localField: 'productId',
//           foreignField: '_id',
//           as: 'productDetails',
//         },
//       },
//       {
//         $unwind: '$productDetails', // Handle cases where there might not be a match
//       },
//       {
//         $project: {
//           _id: 1,
//           quantity: 1,
//           'userDetails.name': 1,
//           'userDetails.email': 1,
//           'productDetails.name': 1,
//           'productDetails.price': 1,
//           'productDetails.image': 1,
//           'productDetails.rating': 1,
//         },
//       },
//     ]);

//     // Log the result for debugging purposes
//     console.log(cart);

//     res.send(cart);
//   } catch (error) {
//     console.error('Error in aggregate pipeline:', error.message || error); // Log the error message
//     res.status(500).send('Internal server error');
//   }
// });

// add to cart

router.post('/addcart', authUser, async (req, res) => {
  try {
    const { _id, quantity } = req.body;
    const findProduct = await Cart.findOne({
      $and: [{ productId: _id }, { user: req.user_id }],
    });
    if (findProduct) {
      return res.status(400).json({ msg: 'Product already in a cart' });
    } else {
      const cart = new Cart({
        user: req.user_id,
        productId: _id,
        quantity,
      });
      const savedCart = await cart.save();
      res.send(savedCart);
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// remove from cart
router.delete('/deletecart/:id', authUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Cart.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});
module.exports = router;
