import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/mongodb';
import Entry from '../../../../models/Entry';
import User from '../../../../models/User';

// PUT /api/entries/[id] - Update an entry
export async function PUT(request, { params }) {
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
    
    const { id } = params;
    const body = await request.json();
    
    const { type, amount, description, date, category, paymentMethod } = body;

    // Validate required fields
    if (!type || !amount || !date || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }

    // Find entry and ensure it belongs to the user
    const entry = await Entry.findOne({ _id: id, userId: user._id });
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    const updatedEntry = await Entry.findByIdAndUpdate(
      id,
      {
        type,
        amount: parseFloat(amount),
        description: description || '',
        date: new Date(date),
        category,
        paymentMethod: paymentMethod || 'cash'
      },
      { new: true, runValidators: true }
    );

    // Update user's financial summary
    await user.updateFinancialSummary();

    const formattedEntry = {
      id: updatedEntry._id.toString(),
      type: updatedEntry.type,
      amount: updatedEntry.amount,
      description: updatedEntry.description,
      date: updatedEntry.date.toISOString().split('T')[0],
      category: updatedEntry.category,
      paymentMethod: updatedEntry.paymentMethod,
      createdAt: updatedEntry.createdAt,
      updatedAt: updatedEntry.updatedAt
    };

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/entries/[id] - Delete an entry
export async function DELETE(request, { params }) {
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
    
    const { id } = params;

    // Find entry and ensure it belongs to the user
    const entry = await Entry.findOne({ _id: id, userId: user._id });
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    const deletedEntry = await Entry.findByIdAndDelete(id);
    
    // Update user's financial summary
    await user.updateFinancialSummary();

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}

// GET /api/entries/[id] - Get single entry
export async function GET(request, { params }) {
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
    
    const { id } = params;

    // Find entry and ensure it belongs to the user
    const entry = await Entry.findOne({ _id: id, userId: user._id });
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    const formattedEntry = {
      id: entry._id.toString(),
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      date: entry.date.toISOString().split('T')[0],
      category: entry.category,
      paymentMethod: entry.paymentMethod,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    };

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
} 