// models/Entry.js
// Mongoose model for income/expense entries

import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi'],
    default: 'cash',
    required: true,
  },
  // Reference to the user who owns this entry
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Entry || mongoose.model('Entry', entrySchema);
