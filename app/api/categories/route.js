import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';

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

// GET /api/categories - Fetch all categories
export async function GET() {
  try {
    await connectDB();
    
    // Get custom categories from database
    const customCategories = await Category.find({}).sort({ name: 1 });
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

// POST /api/categories - Create new category
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { name, color } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    
    // Check if category already exists (case-insensitive)
    const existingCategory = await Category.findOne({ 
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
      color: color || '#888888'
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