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
  // Reference to the user who owns this category
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
