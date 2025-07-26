// models/Category.js
// Mongoose model for custom categories

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  color: {
    type: String,
    default: '#888888', // Optionally store a color for the category
  },
  // Optionally, add a userId field for multi-user support in the future
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
