const connectToMongo = require('./config');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');

const auth = require('./routes/auth');
const cart = require('./routes/cart');
const wishlist = require('./routes/wishlist');
const product = require('./routes/product');
const review = require('./routes/review');
const paymentRoute = require('./routes/paymentRoute');
const forgotPassword = require('./routes/forgotPassword');
const AdminRoute = require('./routes/Admin/AdminAuth');
const dotenv = require('dotenv');
const checkOrigin = require('./middleware/apiAuth');
const cookieParser = require('cookie-parser');
dotenv.config();

connectToMongo();

const port = 5000;

const app = express();

app.use(cookieParser());
app.use(
  '/api/paymentverification',
  bodyParser.raw({ type: 'application/json' })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, 'build')));

app.use(checkOrigin);

app.use('/api/auth', auth);

app.use('/api/product', product);

app.use('/api/cart', cart);

app.use('/api/wishlist', wishlist);

app.use('/api/review', review);

app.use('/api/admin', AdminRoute);

app.use('/api/password', forgotPassword);

app.use('/api', paymentRoute);

app.use('/payment_success', (req, res) => {
  res.status(200).json({
    msg: 'Payment Successful',
  });
});
app.use('/payment_fail', (req, res) => {
  res.status(200).json({
    msg: 'Payment Failed',
  });
});
app.listen(port, () => {
  console.log(`app listening at port : ${port}`);
});
