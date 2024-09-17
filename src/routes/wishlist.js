const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const authUser = require('../middleware/authUser');

router.get('/fetchwishlist', authUser, async (req, res) => {
  try {
    const wishlistData = await Wishlist.find({ user: req.user_id }).populate(
      'productId'
    );
    res.send(wishlistData);
  } catch (error) {
    res.status(500).send('Something went wrong');
  }
});
router.post('/addwishlist', authUser, async (req, res) => {
  try {
    const { id } = req.body;
    const findProduct = await Wishlist.findOne({
      $and: [{ productId: id }, { user: req.user_id }],
    });
    if (findProduct) {
      return res.status(400).json({ msg: 'Product already in a wishlist' });
    } else {
      const savedWishlist = await Wishlist.create({
        user: req.user_id,
        productId: id,
      });
      return res.status(200).send(savedWishlist);
    }
  } catch (error) {
    res.status(500).send('Something went wrong');
  }
});
router.delete('/deletewishlist/:id', authUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Wishlist.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    res.status(500).send('Something went wrong');
  }
});
module.exports = router;
