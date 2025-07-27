// models/User.js
// Mongoose model for users (integrates with Clerk.js)

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Clerk.js user ID (primary identifier)
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // User's email from Clerk
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  // User's full name from Clerk
  fullName: {
    type: String,
    trim: true,
  },
  // User's profile image URL from Clerk
  imageUrl: {
    type: String,
  },
  // User preferences and settings
  preferences: {
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto'],
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
  },
  // User's financial summary (cached for performance)
  financialSummary: {
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    netBalance: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  // Last login timestamp
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for better query performance
userSchema.index({ isActive: 1 });

// Virtual for getting user's display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.email.split('@')[0];
});

// Method to update financial summary
userSchema.methods.updateFinancialSummary = async function() {
  const Entry = mongoose.model('Entry');
  const entries = await Entry.find({ userId: this._id });
  
  const totalIncome = entries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  const totalExpense = entries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  this.financialSummary = {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    lastUpdated: new Date(),
  };
  
  return this.save();
};

// Static method to find or create user from Clerk data
userSchema.statics.findOrCreateFromClerk = async function(clerkUser) {
  let user = await this.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    user = new this({
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      fullName: clerkUser.fullName,
      imageUrl: clerkUser.imageUrl,
    });
    await user.save();
  } else {
    // Update existing user data from Clerk
    user.email = clerkUser.primaryEmailAddress?.emailAddress;
    user.fullName = clerkUser.fullName;
    user.imageUrl = clerkUser.imageUrl;
    user.lastLogin = new Date();
    await user.save();
  }
  
  return user;
};

// Prevent model recompilation error
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User; 