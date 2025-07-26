import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Entry from '../../../../models/Entry';

// DELETE /api/entries/[id] - Delete an entry
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deletedEntry = await Entry.findByIdAndDelete(id);
    
    if (!deletedEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

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
    await connectDB();
    const { id } = params;

    const entry = await Entry.findById(id);
    
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