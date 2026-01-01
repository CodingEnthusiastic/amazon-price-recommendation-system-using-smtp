const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  checked_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
