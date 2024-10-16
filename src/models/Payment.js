const mongoose = require('mongoose');
const { Schema } = mongoose;
const PaymentSchema = new Schema(
  {
    stripe_order_id: {
      type: String,
      required: true,
    },
    stripe_payment_id: {
      type: String,
      required: true,
    },
    productData: [
      {
        type: Object,
        required: true,
      },
    ],
    userData: {
      type: Object,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    totalAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('payment', PaymentSchema);
