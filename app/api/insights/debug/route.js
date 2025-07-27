import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/mongodb';
import Entry from '../../../../models/Entry';
import User from '../../../../models/User';
import { processFinancialData, generateFinancialInsights } from '../../../../lib/gemini';

// GET /api/insights/debug - Debug endpoint to see raw AI response
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find user
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's entries
    const entries = await Entry.find({ userId: user._id }).sort({ date: -1, createdAt: -1 });
    
    if (!entries || entries.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No financial data available',
        message: 'Add some entries first to test insights'
      });
    }

    // Process financial data
    const financialData = processFinancialData(entries);
    
    if (!financialData) {
      return NextResponse.json({
        success: false,
        error: 'Unable to process financial data'
      });
    }

    // Generate insights and return debug info
    const result = await generateFinancialInsights(financialData);
    
    return NextResponse.json({
      success: true,
      debug: {
        apiKeyConfigured: !!process.env.GEMINI_API_KEY,
        dataProcessed: !!financialData,
        dataPoints: Object.keys(financialData).length,
        totalEntries: entries.length,
        resultSuccess: result.success,
        hasRawResponse: !!result.rawResponse,
        timestamp: result.timestamp
      },
      financialData: {
        summary: financialData.summary,
        topCategories: financialData.topCategories,
        dataPeriod: financialData.dataPeriod
      },
      aiResponse: {
        success: result.success,
        insights: result.insights,
        rawResponse: result.rawResponse,
        error: result.error
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 