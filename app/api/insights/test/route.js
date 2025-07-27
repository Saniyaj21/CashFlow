import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// GET /api/insights/test - Test Gemini API connection
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured',
        message: 'Please add GEMINI_API_KEY to your environment variables'
      }, { status: 500 });
    }

    // Test Gemini API connection
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Hello! Please respond with 'Gemini API is working correctly' if you can read this message.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: 'Gemini API connection successful',
      response: text,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });

  } catch (error) {
    console.error('Error testing Gemini API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Gemini API',
      message: error.message,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GEMINI_API_KEY
    }, { status: 500 });
  }
} 