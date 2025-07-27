// lib/gemini.js
// Gemini API integration for financial insights

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Financial data analysis prompt template
const createAnalysisPrompt = (financialData) => {
  return `
You are a professional financial advisor analyzing personal finance data for an Indian user. All amounts in the data are in Indian Rupees (₹/INR).

FINANCIAL DATA:
${JSON.stringify(financialData, null, 2)}

IMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON.

CRITICAL: All amounts in the financial data are in Indian Rupees (₹), NOT US Dollars. When analyzing and providing recommendations, always refer to amounts as "₹" or "rupees" or "INR".

Analyze the financial data and provide insights in this exact JSON format:

{
  "healthScore": 85,
  "totalIncome": 40622,
  "totalExpense": 11500,
  "netBalance": 29122,
  "savingsRate": 72,
  "spendingAnalysis": "Your spending analysis shows...",
  "savingsInsights": "Based on your savings pattern...",
  "budgetRecommendations": "To optimize your budget...",
  "smartTips": [
    "Tip 1: Specific actionable advice",
    "Tip 2: Another specific tip",
    "Tip 3: Third actionable tip"
  ],
  "trendAnalysis": "Your financial trends indicate...",
  "riskAssessment": "Current financial risks include...",
  "priorityActions": [
    "Action 1: Immediate priority",
    "Action 2: Second priority"
  ],
  "topSpendingCategories": [
    {"category": "Shopping", "amount": 11000, "percentage": 96},
    {"category": "Bills", "amount": 450, "percentage": 4}
  ],
  "paymentMethodBreakdown": {
    "upi": 51450,
    "cash": 672
  }
}

Guidelines:
- healthScore: Rate 0-100 based on income vs expenses, savings rate, and financial stability
- totalIncome: Total income amount in ₹ (extract from data)
- totalExpense: Total expense amount in ₹ (extract from data)
- netBalance: Income minus expenses in ₹ (can be negative)
- savingsRate: Percentage of income saved (calculate: (income-expense)/income * 100)
- spendingAnalysis: Analyze spending patterns, categories, and payment methods. Always mention amounts in ₹ (rupees)
- savingsInsights: Evaluate savings behavior and opportunities. Use ₹ for all amounts
- budgetRecommendations: Specific, actionable budget improvements for Indian context
- smartTips: 3-5 practical, specific tips based on the user's actual spending patterns, income level, and financial behavior. Avoid generic advice like "use budgeting apps" - make tips specific to their data and situation
- trendAnalysis: Compare current vs previous periods if data available. Use ₹ for amounts
- riskAssessment: Identify potential financial risks or concerns for Indian users
- priorityActions: 2-3 most important actions to take
- topSpendingCategories: Array of top 3-5 spending categories with amounts and percentages
- paymentMethodBreakdown: Object with upi and cash totals

IMPORTANT: Each tip should be unique and specific to the user's financial data. Avoid repetitive or generic advice.

IMPORTANT CURRENCY NOTES:
- All amounts are in Indian Rupees (₹)
- Use ₹ symbol or "rupees" when referring to amounts
- Consider Indian financial context (UPI, cash usage, Indian banking practices)
- Reference Indian financial products and services when relevant

Be specific to the data provided. Analyze the user's actual spending patterns, income sources, categories, and payment methods. Provide personalized advice based on their specific financial behavior. Avoid generic advice like "use budgeting apps" unless specifically relevant to their situation. If limited data, acknowledge this and provide guidance based on what data is available.
`;
};

// Process financial data for analysis
export const processFinancialData = (entries) => {
  if (!entries || entries.length === 0) {
    return null;
  }

  // Calculate basic statistics
  const totalIncome = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalExpense = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryBreakdown = entries.reduce((acc, entry) => {
    if (entry.type === 'expense') {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    }
    return acc;
  }, {});

  // Payment method breakdown
  const paymentMethodBreakdown = entries.reduce((acc, entry) => {
    const method = entry.paymentMethod || 'cash';
    acc[method] = (acc[method] || 0) + entry.amount;
    return acc;
  }, {});

  // Monthly trends (last 6 months)
  const monthlyData = {};
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  entries.forEach(entry => {
    const date = new Date(entry.date);
    if (date >= sixMonthsAgo) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      monthlyData[monthKey][entry.type] += entry.amount;
    }
  });

  // Recent entries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentEntries = entries.filter(entry => 
    new Date(entry.date) >= thirtyDaysAgo
  );

  return {
    summary: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalEntries: entries.length,
      averageIncome: totalIncome / Math.max(1, entries.filter(e => e.type === 'income').length),
      averageExpense: totalExpense / Math.max(1, entries.filter(e => e.type === 'expense').length),
      currency: 'INR',
      currencySymbol: '₹'
    },
    categoryBreakdown,
    paymentMethodBreakdown,
    monthlyTrends: monthlyData,
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupees'
    },
    recentActivity: {
      entries: recentEntries,
      count: recentEntries.length,
      period: '30 days'
    },
    topCategories: Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount })),
    dataPeriod: {
      startDate: entries[entries.length - 1]?.date,
      endDate: entries[0]?.date,
      totalDays: entries.length > 0 ? 
        Math.ceil((new Date(entries[0].date) - new Date(entries[entries.length - 1].date)) / (1000 * 60 * 60 * 24)) : 0
    }
  };
};

// Generate financial insights using Gemini API
export const generateFinancialInsights = async (financialData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    if (!financialData) {
      throw new Error('No financial data provided');
    }

    // Create the model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate the analysis prompt
    const prompt = createAnalysisPrompt(financialData);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    try {
      // Clean the response text to extract JSON
      let cleanedText = text.trim();
      
      // Remove any markdown code blocks
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      const insights = JSON.parse(cleanedText);
      
      // Validate required fields
      const requiredFields = ['healthScore', 'totalIncome', 'totalExpense', 'netBalance', 'savingsRate', 'spendingAnalysis', 'savingsInsights', 'budgetRecommendations', 'smartTips', 'trendAnalysis', 'riskAssessment', 'priorityActions', 'topSpendingCategories', 'paymentMethodBreakdown'];
      const missingFields = requiredFields.filter(field => !insights[field]);
      
      if (missingFields.length > 0) {
        console.warn('Missing fields in AI response:', missingFields);
        // Fill missing fields with defaults
        missingFields.forEach(field => {
          if (field === 'healthScore') insights[field] = 75;
          else if (field === 'smartTips') insights[field] = ["Review your spending patterns", "Set up a budget", "Track your expenses regularly"];
          else if (field === 'priorityActions') insights[field] = ["Review recent transactions", "Set financial goals"];
          else insights[field] = "Analysis in progress";
        });
      }
      
      return {
        success: true,
        insights,
        timestamp: new Date().toISOString(),
        dataPoints: Object.keys(financialData).length
      };
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Raw AI response:', text);
      
      // If JSON parsing fails, return the raw text
      return {
        success: true,
        insights: {
          healthScore: 75,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          savingsRate: 0,
          spendingAnalysis: "Unable to parse detailed analysis for your Indian Rupee transactions",
          savingsInsights: "Analysis available in raw format for your ₹ transactions",
          budgetRecommendations: "Please review your financial data in Indian Rupees",
          smartTips: ["Review your spending patterns in ₹", "Set up a budget in Indian Rupees", "Track your expenses regularly"],
          trendAnalysis: "Analysis in progress for your INR transactions",
          riskAssessment: "Continue monitoring your finances in Indian Rupees",
          priorityActions: ["Review recent ₹ transactions", "Set financial goals in INR"],
          topSpendingCategories: [],
          paymentMethodBreakdown: { upi: 0, cash: 0 }
        },
        rawResponse: text,
        timestamp: new Date().toISOString(),
        dataPoints: Object.keys(financialData).length
      };
    }

  } catch (error) {
    console.error('Error generating financial insights:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      fallbackInsights: {
        healthScore: 70,
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        savingsRate: 0,
        spendingAnalysis: "Unable to analyze your Indian Rupee transactions at this time",
        savingsInsights: "Please try again later for your ₹ savings analysis",
        budgetRecommendations: "Consider setting up a budget in Indian Rupees",
        smartTips: ["Track your expenses in ₹", "Set financial goals in INR", "Review spending regularly"],
        trendAnalysis: "Analysis temporarily unavailable for your INR transactions",
        riskAssessment: "Continue monitoring your finances in Indian Rupees",
        priorityActions: ["Keep tracking expenses in ₹", "Set up emergency fund in INR"],
        topSpendingCategories: [],
        paymentMethodBreakdown: { upi: 0, cash: 0 }
      }
    };
  }
};

// Cache insights to avoid repeated API calls
const insightsCache = new Map();

export const getCachedInsights = (userId) => {
  const cached = insightsCache.get(userId);
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
    return cached.insights;
  }
  return null;
};

export const cacheInsights = (userId, insights) => {
  insightsCache.set(userId, {
    insights,
    timestamp: Date.now()
  });
};

export const clearInsightsCache = (userId) => {
  if (userId) {
    insightsCache.delete(userId);
  } else {
    insightsCache.clear();
  }
}; 