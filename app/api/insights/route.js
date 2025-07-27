import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/mongodb';
import Entry from '../../../models/Entry';
import User from '../../../models/User';
import { 
  processFinancialData, 
  generateFinancialInsights, 
  getCachedInsights, 
  cacheInsights 
} from '../../../lib/gemini';

// GET /api/insights - Get financial insights for current user
export async function GET(request) {
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

    // Check for cached insights first
    const cachedInsights = getCachedInsights(userId);
    if (cachedInsights) {
      return NextResponse.json({
        success: true,
        insights: cachedInsights,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Get user's entries
    const entries = await Entry.find({ userId: user._id }).sort({ date: -1, createdAt: -1 });
    
    if (!entries || entries.length === 0) {
      return NextResponse.json({
        success: true,
        insights: {
          healthScore: 50,
          spendingAnalysis: "No financial data available yet. Start tracking your income and expenses to get personalized insights.",
          savingsInsights: "Begin by adding your first transaction to understand your financial patterns.",
          budgetRecommendations: "Create your first budget by adding income and expense entries.",
          smartTips: [
            "Add your first income entry to start tracking",
            "Record your daily expenses to understand spending patterns",
            "Set up categories for better organization",
            "Review your finances regularly"
          ],
          trendAnalysis: "No trends available yet. Add more data to see patterns.",
          riskAssessment: "Continue building your financial data for better analysis.",
          priorityActions: [
            "Add your first transaction",
            "Set up expense categories",
            "Track your income sources"
          ]
        },
        message: "No financial data available",
        timestamp: new Date().toISOString()
      });
    }

    // Process financial data
    const financialData = processFinancialData(entries);
    
    if (!financialData) {
      return NextResponse.json({
        success: false,
        error: 'Unable to process financial data',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Generate insights using Gemini API
    const result = await generateFinancialInsights(financialData);
    
    if (result.success) {
      // Cache the insights
      cacheInsights(userId, result.insights);
      
      return NextResponse.json({
        success: true,
        insights: result.insights,
        cached: false,
        timestamp: result.timestamp,
        dataPoints: result.dataPoints,
        summary: {
          totalEntries: entries.length,
          analysisPeriod: financialData.dataPeriod
        }
      });
    } else {
      // Return fallback insights if API fails
      return NextResponse.json({
        success: true,
        insights: result.fallbackInsights,
        cached: false,
        timestamp: result.timestamp,
        warning: "Using fallback insights due to API issues",
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate insights',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/insights - Force refresh insights (clear cache and regenerate)
export async function POST(request) {
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

    // Clear cache for this user
    const { clearInsightsCache } = await import('../../../lib/gemini');
    clearInsightsCache(userId);

    // Get fresh data and regenerate insights
    const entries = await Entry.find({ userId: user._id }).sort({ date: -1, createdAt: -1 });
    
    if (!entries || entries.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No financial data available for analysis',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const financialData = processFinancialData(entries);
    const result = await generateFinancialInsights(financialData);
    
    if (result.success) {
      cacheInsights(userId, result.insights);
      
      return NextResponse.json({
        success: true,
        insights: result.insights,
        refreshed: true,
        timestamp: result.timestamp,
        dataPoints: result.dataPoints
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error refreshing insights:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh insights',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 