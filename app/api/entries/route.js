import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Entry from '../../../models/Entry';

// GET /api/entries - Fetch all entries
export async function GET() {
  try {
    await connectDB();
    const entries = await Entry.find({}).sort({ date: -1, createdAt: -1 });
    
    // Convert to plain objects and format dates
    const formattedEntries = entries.map(entry => ({
      id: entry._id.toString(),
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      date: entry.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      category: entry.category,
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

// POST /api/entries - Create new entry
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { type, amount, description, date, category } = body;
    
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
      category
    });

    const savedEntry = await entry.save();
    
    // Format response
    const formattedEntry = {
      id: savedEntry._id.toString(),
      type: savedEntry.type,
      amount: savedEntry.amount,
      description: savedEntry.description,
      date: savedEntry.date.toISOString().split('T')[0],
      category: savedEntry.category,
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