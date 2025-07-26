import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

// GET /api/users - Get current user data
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      preferences: user.preferences,
      financialSummary: user.financialSummary,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create or update user
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get user data from Clerk
    const { currentUser } = await import('@clerk/nextjs/server');
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unable to get user data' }, { status: 400 });
    }

    // Create or update user in our database
    const user = await User.findOrCreateFromClerk(clerkUser);

    return NextResponse.json({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      preferences: user.preferences,
      financialSummary: user.financialSummary,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users - Update user preferences
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body;

    await connectDB();
    
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    return NextResponse.json({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      preferences: user.preferences,
      financialSummary: user.financialSummary,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 