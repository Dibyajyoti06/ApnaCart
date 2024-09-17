const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const authUser = require('../middleware/authUser');
const { deleteAllUserData } = require('../controller/deleteUser');
// create a user :post "/auth", !auth
let success = false;
router.post(
  '/register',
  [
    body('firstName', 'Enter a valid name').isLength({ min: 1 }),
    body('lastName', 'Enter a valid name').isLength({ min: 1 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({
      min: 5,
    }),
    body('phoneNumber', 'Enter a valid phone number').isLength({
      min: 10,
      max: 10,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const { firstName, lastName, email, phoneNumber, password, isAdmin } =
      req.body;
    try {
      let user = await User.findOne({
        $or: [{ email: email }, { phoneNumber: phoneNumber }],
      });
      if (user) {
        return res.status(400).send({ error: 'Sorry a user already exists' });
      }

      // password hashing
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      // create a new user
      user = await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: secPass,
        isAdmin,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      // const authToken = jwt.sign(data, process.env.JWT_SECRET);
      const newUser = await User.findById(user.id).select('-password');
      return res.status(201).send({ success, newUser });
    } catch (error) {
      res.status(500).send('Internal server error');
    }
  }
);

// login Route
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ success, error: 'User not found' });
      }
      const passComp = await bcrypt.compare(password, user.password);
      if (!passComp) {
        return res.status(400).send({
          success,
          error: 'Please try to login with correct credentials',
        });
      }

      const data = {
        user: {
          id: user._id,
        },
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      const loggedInUser = await User.findById(user._id).select('-password');
      success = true;
      res.status(200).send({
        success,
        loggedInUser,
        authToken,
        msg: 'You are successfully LogedIn',
      });
    } catch (error) {
      res.status(500).send('Internal server error002');
    }
  }
);
// logged in user details

router.get('/getuser', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user_id).select('-password');
    success = true;
    return res.status(200).json(user);
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
});

// update user details
router.put('/updateuser', authUser, async (req, res) => {
  const { userDetails } = req.body;
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    zipCode,
    city,
    userState,
  } = userDetails;
  try {
    const user = await User.findById(req.user_id);
    if (user) {
      let updateDetails = await User.findByIdAndUpdate(
        req.user_id,
        {
          $set: userDetails,
        },
        { new: true }
      );
      success = true;
      res.status(200).send({ success, updateDetails });
    } else {
      return res.status(400).send('User Not Found');
    }
  } catch (error) {
    res.send('Something went wrong');
  }
});

// delete user and user data
router.delete('/delete/user/:userId', authUser, deleteAllUserData);
module.exports = router;
