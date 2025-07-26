// lib/userUtils.js
// Utility functions for user operations

import connectDB from './mongodb';
import User from '../models/User';

/**
 * Get or create user from Clerk data
 * @param {string} clerkUserId - Clerk user ID
 * @param {Object} clerkUserData - User data from Clerk
 * @returns {Promise<Object>} User object
 */
export async function getOrCreateUser(clerkUserId, clerkUserData = {}) {
  try {
    await connectDB();
    
    let user = await User.findOne({ clerkId: clerkUserId });
    
    if (!user) {
      // Create new user
      user = new User({
        clerkId: clerkUserId,
        email: clerkUserData.email || clerkUserData.primaryEmailAddress?.emailAddress,
        fullName: clerkUserData.fullName || clerkUserData.name,
        imageUrl: clerkUserData.imageUrl || clerkUserData.picture,
      });
      await user.save();
    } else {
      // Update existing user data
      user.email = clerkUserData.email || clerkUserData.primaryEmailAddress?.emailAddress || user.email;
      user.fullName = clerkUserData.fullName || clerkUserData.name || user.fullName;
      user.imageUrl = clerkUserData.imageUrl || clerkUserData.picture || user.imageUrl;
      user.lastLogin = new Date();
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}

/**
 * Get user by Clerk ID
 * @param {string} clerkUserId - Clerk user ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserByClerkId(clerkUserId) {
  try {
    await connectDB();
    return await User.findOne({ clerkId: clerkUserId });
  } catch (error) {
    console.error('Error in getUserByClerkId:', error);
    throw error;
  }
}

/**
 * Update user preferences
 * @param {string} clerkUserId - Clerk user ID
 * @param {Object} preferences - New preferences
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserPreferences(clerkUserId, preferences) {
  try {
    await connectDB();
    
    const user = await User.findOne({ clerkId: clerkUserId });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    throw error;
  }
}

/**
 * Update user's financial summary
 * @param {string} clerkUserId - Clerk user ID
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserFinancialSummary(clerkUserId) {
  try {
    await connectDB();
    
    const user = await User.findOne({ clerkId: clerkUserId });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    await user.updateFinancialSummary();
    return user;
  } catch (error) {
    console.error('Error in updateUserFinancialSummary:', error);
    throw error;
  }
} 