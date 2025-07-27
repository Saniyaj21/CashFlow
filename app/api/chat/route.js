import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/mongodb';
import Entry from '../../../models/Entry';
import User from '../../../models/User';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/chat - Handle AI chat messages
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationHistory = [] } = await request.json();
    
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectDB();
    
    // Find user
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's financial data for context
    const entries = await Entry.find({ userId: user._id }).sort({ date: -1, createdAt: -1 });
    
    // Create context from financial data
    const financialContext = createFinancialContext(entries);
    
    // Create the chat prompt
    const chatPrompt = createChatPrompt(message, financialContext, conversationHistory);
    
    // Generate response using Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(chatPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Clean any markdown formatting that might still be present
    const cleanResponse = cleanMarkdown(aiResponse);

    return NextResponse.json({
      success: true,
      response: cleanResponse,
      timestamp: new Date().toISOString(),
      context: {
        totalEntries: entries.length,
        hasFinancialData: entries.length > 0
      }
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process chat message',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Create financial context from user's data
function createFinancialContext(entries) {
  if (!entries || entries.length === 0) {
    return {
      hasData: false,
      message: "No financial data available yet. The user hasn't added any income or expense entries."
    };
  }

  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpense;
  
  // Group by category
  const categoryBreakdown = entries.reduce((acc, entry) => {
    const category = entry.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { income: 0, expense: 0, count: 0 };
    }
    acc[category][entry.type] += entry.amount;
    acc[category].count += 1;
    return acc;
  }, {});

  // Get recent entries
  const recentEntries = entries.slice(0, 10).map(e => ({
    type: e.type,
    amount: e.amount,
    category: e.category,
    description: e.description,
    date: e.date,
    paymentMethod: e.paymentMethod
  }));

  // Payment method breakdown
  const paymentMethods = entries.reduce((acc, entry) => {
    const method = entry.paymentMethod || 'cash';
    if (!acc[method]) acc[method] = 0;
    acc[method] += entry.amount;
    return acc;
  }, {});

  return {
    hasData: true,
    summary: {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0
    },
    categoryBreakdown,
    recentEntries,
    paymentMethods,
    totalEntries: entries.length
  };
}

// Create chat prompt with financial context
function createChatPrompt(userMessage, financialContext, conversationHistory) {
  const basePrompt = `You are a professional financial advisor and AI assistant for an Indian user. All amounts in the financial data are in Indian Rupees (₹/INR).

IMPORTANT GUIDELINES:
- Always refer to amounts in Indian Rupees (₹) or "rupees" or "INR"
- Provide practical, actionable advice specific to Indian financial context
- Consider Indian banking practices, UPI, and financial products
- Be conversational, helpful, and encouraging
- KEEP RESPONSES SHORT AND TO THE POINT - maximum 2-3 sentences
- Focus on the most important actionable advice only
- Avoid lengthy explanations or multiple suggestions
- If the user has financial data, use it to provide personalized advice
- If no financial data, provide general guidance and encourage them to start tracking
- DO NOT use markdown formatting (no **bold**, *italic*, or other markdown syntax)
- Use plain text only - no special formatting characters

FINANCIAL CONTEXT:
${JSON.stringify(financialContext, null, 2)}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

USER MESSAGE: ${userMessage}

Please provide a short, direct response (2-3 sentences max) based on the user's financial context and question. Use plain text only without any markdown formatting.`;

  return basePrompt;
}

// Clean markdown formatting from text
function cleanMarkdown(text) {
  if (!text) return text;
  
  return text
    // Remove bold formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic formatting
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code formatting
    .replace(/`(.*?)`/g, '$1')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove list markers
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '• ')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
} 