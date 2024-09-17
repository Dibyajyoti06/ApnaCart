const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

let productInfo = {};
let userData = {};
let userInfo;
let totalAmount;
const checkout = async (req, res) => {
  try {
    const { amount, userId, productDetails, userDetails } = req.body;
    totalAmount = Number(amount);
    userInfo = userId;
    productInfo =
      typeof productDetails === 'string'
        ? JSON.parse(productDetails)
        : productDetails;
    userData =
      typeof userDetails === 'string' ? JSON.parse(userDetails) : userDetails;

    const options = {
      line_items: productInfo.map((product) => ({
        price_data: {
          currency: 'INR',
          product_data: {
            name: product.productId.name,
            images: [product.productId.image],
          },
          unit_amount: product.productId.price * 100,
        },
        quantity: product.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL_1}/paymentsuccess`,
      cancel_url: `${process.env.FRONTEND_URL_1}/paymentfailure`,
    };
    const order = await stripe.checkout.sessions.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
  }
};
const paymentVerification = async (req, res) => {
  try {
    const { userId, stripe_order_id, stripe_payment_id, productInfo } =
      req.body;
    console.log(req.body);
    // const session = await stripe.checkout.sessions.retrieve(
    //   req.body.session_id
    // );
    // console.log(session);
    // if (session.payment_status === 'paid') {
    //   // If the payment was successful, proceed with further actions like sending an email
    //   const transport = nodemailer.createTransport({
    //     host: 'smtp.ethereal.email',
    //     port: 587,
    //     secure: false,
    //     auth: {
    //       user: process.env.EMAIL,
    //       pass: process.env.EMAIL_PASSWORD,
    //     },
    //   });

    //   // Define email content using user and order data from the session
    //   const mailOptions = {
    //     from: process.env.EMAIL,
    //     to: session.customer_details.email, // Using Stripe session's customer email
    //     subject: 'Order Confirmation',
    //     html: `
    //       <html>
    //         <body>
    //           <h1>Order Confirmation</h1>
    //           <p>Dear ${session.customer_details.name},</p>
    //           <p>Thank you for your purchase. Your order of $${(
    //             session.amount_total / 100
    //           ).toFixed(2)} has been confirmed.</p>
    //           <p>We have received your payment and will process your order soon.</p>
    //           <h2>Shipping Address:</h2>
    //           <p>${session.customer_details.address.line1}, ${
    //       session.customer_details.address.city
    //     }, ${session.customer_details.address.postal_code}</p>
    //           <p>If you have any questions, feel free to contact us.</p>
    //           <p>Best regards,<br>ShopIt.com Team</p>
    //         </body>
    //       </html>
    //     `,
    //   };

    //   // Send the confirmation email to the user
    //   await transport.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //       return res.status(400).send(error);
    //     } else {
    //       return res.status(200).send({ success, msg: 'Order Confirm', info });
    //     }
    //   });
    //   const userDetails = {
    //     email: session.customer_details.email,
    //     name: session.customer_details.name,
    //   };
    //   const payment = await Payment.create({
    //     stripe_order_id,
    //     stripe_payment_id,
    //     user: userId,
    //     productData: productInfo,
    //     userData: userDetails,
    //     totalAmount: session.amount_total,
    //   });
    //   await Cart.deleteMany({ user: userId });
    //   res.status(200).send({ success: true, payment });
    // } else {
    //   res.status(400).json({
    //     success: false,
    //   });
    // }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { checkout, paymentVerification };
