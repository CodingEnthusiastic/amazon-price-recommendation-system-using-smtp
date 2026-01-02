const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  product_name: {
    type: String,
    default: 'Unknown Product'
  },
  target_price: {
    type: Number,
    required: true
  },
  current_price: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'UNKNOWN'],
    default: 'INR'
  },
  last_checked: {
    type: Date,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
