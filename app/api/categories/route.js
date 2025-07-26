import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';
import User from '../../../models/User';

// Default categories
const DEFAULT_CATEGORIES = [
  'General',
  'Salary',
  'Groceries',
  'Food',
  'Shopping',
  'Bills',
  'Transport',
  'Health',
  'Entertainment',
  'Other',
];

// GET /api/categories - Fetch all categories for current user
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find user by Clerk ID or create if doesn't exist
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Create user if they don't exist
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'Unable to get user data' }, { status: 400 });
      }
      
      user = await User.findOrCreateFromClerk(clerkUser);
    }
    
    // Get custom categories for this user only
    const customCategories = await Category.find({ userId: user._id }).sort({ name: 1 });
    const customCategoryNames = customCategories.map(cat => cat.name);
    
    // Combine default and custom categories, removing duplicates
    const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...customCategoryNames])];
    
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category for current user
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find user by Clerk ID or create if doesn't exist
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Create user if they don't exist
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'Unable to get user data' }, { status: 400 });
      }
      
      user = await User.findOrCreateFromClerk(clerkUser);
    }
    
    const body = await request.json();
    
    const { name, color } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    
    // Check if category already exists for this user (case-insensitive)
    const existingCategory = await Category.findOne({ 
      userId: user._id,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } 
    });
    
    if (existingCategory || DEFAULT_CATEGORIES.some(cat => 
      cat.toLowerCase() === trimmedName.toLowerCase()
    )) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    const category = new Category({
      name: trimmedName,
      color: color || '#888888',
      userId: user._id
    });

    await category.save();
    
    return NextResponse.json({ 
      name: category.name,
      color: category.color 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 