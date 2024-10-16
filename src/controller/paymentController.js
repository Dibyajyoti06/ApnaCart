const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

let productInfo;
let userData;
let userInfo;
let totalAmount;
const checkout = async (req, res) => {
  try {
    const { amount, userId, productDetails, userDetails } = req.body;
    totalAmount = Number(amount);
    userInfo = userId;
    productInfo = productDetails.map((product) => {
      const parsedProductId =
        typeof product.productId === 'string'
          ? JSON.parse(product.productId)
          : product.productId;
      return {
        ...parsedProductId,
        quantity: product.quantity,
      };
    });
    userData =
      typeof userDetails === 'string' ? JSON.parse(userDetails) : userDetails;
    const options = {
      line_items: productDetails.map((product) => ({
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
    const session = await stripe.checkout.sessions.create(options);

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.log(error);
  }
};

const paymentVerification = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    // Construct the event with the raw body and the Stripe signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    // Retrieve the session from Stripe using the session ID
    const session = await stripe.checkout.sessions.retrieve(
      event.data.object.id
    );

    // Check if the payment was successful
    if (session.payment_status === 'paid') {
      // Define the stripe order and payment IDs
      const stripe_order_id = session.id;
      const stripe_payment_id = session.payment_intent;
      const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: userData.userEmail,
        subject: 'Order Confirm',
        html: `<!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <title>Order Confirmation</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        font-size: 16px;
                        line-height: 1.5;
                        color: black;
                      }
                
                      h1 {
                        font-size: 24px;
                        margin-bottom: 20px;
                        color: black;
                      }
                
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                      }
                         th {
                text-align: left;
                padding: 10px;
                background-color: #eee;
              }
        
              td {
                padding: 10px;
                border: 1px solid #ddd;
              }
        
              .address {
                margin-bottom: 20px;
                color: black;

              }
        
              .address h2 {
                font-size: 20px;
                margin-bottom: 10px;
              }
        
              .address p {
                margin: 0;
              }
         .thanks {
                font-size: 18px;
                margin-top: 20px;
                color: black;

              }
        
              .signature {
                margin-top: 40px;
                color: black;

              }
        
              .signature p {
                margin: 0;
              }
            </style>
          </head>
          <body>
            <h1>Order Confirmation</h1>
            <p style="color:black;">Dear <b>${userData.firstName} ${
          userData.lastName
        }</b>,</p>
            <p>Thank you for your recent purchase on our website. We have received your payment of <b>₹${totalAmount}</b> and have processed your order.</p>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
               ${productInfo
                 .map((product) => {
                   return `
                            <tr>
                              <td>${product.productId.name}</td>
                              <td>${product.quantity}</td>
                              <td>₹${product.productId.price}</td>
                            </tr>
                          `;
                 })
                 .join('')}
          <tr>
          <td>Shipping Charge</td>
          <td></td>
          <td>₹100</td>
           </tr>
        <tr>
          <td>Total</td>
          <td></td>
          <td>₹${totalAmount}</td>
        </tr>
              </tbody >
            </table >
            <div class="address">
              <h2>Shipping Address</h2>
              <p>${userData.firstName} ${userData.lastName}</p>
              <p>${userData.address}</p>
              <p>${userData.city}-${userData.zipCode}</p>
              <p>${userData.userState}</p>
            </div>
            <p class="thanks">Thank you for choosing our website. If you have any questions or concerns, please don't hesitate to contact us.</p>
            <div class="signature">
              <p>Best regards,</p>
            </div>
          </body >
        </html >
  `,
        text: `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Order Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: black;
        }
  
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
          color: black;
        }
  
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
               th {
                text-align: left;
                padding: 10px;
                background-color: #eee;
              }
        
              td {
                padding: 10px;
                border: 1px solid #ddd;
              }
        
              .address {
                margin-bottom: 20px;
                color: black;

              }
        
              .address h2 {
                font-size: 20px;
                margin-bottom: 10px;
              }
        
              .address p {
                margin: 0;
              }
        
              .thanks {
               font-size: 18px;
                margin-top: 20px;
                color: black;

              }
        
              .signature {
                margin-top: 40px;
                color: black;

              }
        
              .signature p {
                margin: 0;
              }
            </style>
          </head>
          <body>
            <h1>Order Confirmation</h1>
            <p style="color:black;">Dear <b>${userData.firstName} ${
          userData.lastName
        }</b>,</p>
            <p>Thank you for your recent purchase on our website. We have received your payment of <b>₹${totalAmount}</b> and have processed your order.</p>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${productInfo
                  .map((product) => {
                    return `
                            <tr>
                              <td>${product.productId.name}</td>
                              <td>${product.quantity}</td>
                              <td>₹${product.productId.price}</td>
                            </tr>
                          `;
                  })
                  .join('')}
          <tr>
          <td>Shipping Charge</td>
          <td></td>
          <td>₹100</td>
        </tr>
        <tr>
          <td>Total</td>
          <td></td>
          <td>₹${totalAmount}</td>
        </tr>
         </tbody >
            </table >
            <div class="address">
              <h2>Shipping Address</h2>
              <p>${userData.firstName} ${userData.lastName}</p>
              <p>${userData.address}</p>
              <p>${userData.city}-${userData.zipCode}</p>
              <p>${userData.userState}</p>
            </div>
            <p class="thanks">Thank you for choosing our website. If you have any questions or concerns, please don't hesitate to contact us.</p>
            <div class="signature">
              <p>Best regards,</p>
            </div>
          </body >
        </html >
  `,
      };
      await transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res
            .status(500)
            .json({ message: 'Email could not be sent', error });
        } else {
          return res
            .status(200)
            .json({ message: 'Reset link sent to your email address', info });
        }
      });
      // Create a payment record in the database
      const payment = await Payment.create({
        stripe_order_id,
        stripe_payment_id,
        user: userInfo,
        productData: productInfo,
        userData,
        totalAmount: session.amount_total / 100,
      });

      if (!payment) {
        console.log('Payment creation failed!');
        return res
          .status(500)
          .json({ success: false, error: 'Payment creation failed' });
      }

      await Cart.deleteMany({ user: userInfo });
      res.status(200).json({ success: true, payment });
    } else {
      res
        .status(400)
        .json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Error verifying Stripe signature:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = { checkout, paymentVerification };
