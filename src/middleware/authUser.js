const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const fetchUser = (req, res, next) => {
  // get the user from the jwt token and id to req objectPosition:
  const token = req.header('Authorization');
  if (!token) {
    return res.status(400).send('Access denied');
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user_id = data.user.id;
    next();
  } catch (error) {
    res.status(400).send('Access denied');
  }
};

module.exports = fetchUser;
