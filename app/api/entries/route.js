import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/mongodb';
import Entry from '../../../models/Entry';
import User from '../../../models/User';

// GET /api/entries - Fetch all entries for current user
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
    
    // Get entries for this user only
    const entries = await Entry.find({ userId: user._id }).sort({ date: -1, createdAt: -1 });
    
    // Convert to plain objects and format dates
    const formattedEntries = entries.map(entry => ({
      id: entry._id.toString(),
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      date: entry.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      category: entry.category,
      paymentMethod: entry.paymentMethod,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }));

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// POST /api/entries - Create new entry for current user
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
    
    const { type, amount, description, date, category, paymentMethod } = body;
    
    // Validate required fields
    if (!type || !amount || !date || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, date, category' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }

    const entry = new Entry({
      type,
      amount: parseFloat(amount),
      description: description || '',
      date: new Date(date),
      category,
      paymentMethod: paymentMethod || 'cash',
      userId: user._id
    });

    const savedEntry = await entry.save();
    
    // Update user's financial summary
    await user.updateFinancialSummary();
    
    // Format response
    const formattedEntry = {
      id: savedEntry._id.toString(),
      type: savedEntry.type,
      amount: savedEntry.amount,
      description: savedEntry.description,
      date: savedEntry.date.toISOString().split('T')[0],
      category: savedEntry.category,
      paymentMethod: savedEntry.paymentMethod,
      createdAt: savedEntry.createdAt,
      updatedAt: savedEntry.updatedAt
    };

    return NextResponse.json(formattedEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
} 