# 🧠 Gemini API Integration Setup Guide

## Overview
This guide will help you set up the Gemini API integration for financial insights in your CashFlow app.

## 🔑 Step 1: Get Gemini API Key

1. **Visit Google AI Studio:**
   - Go to [https://aistudio.google.com/](https://aistudio.google.com/)
   - Sign in with your Google account

2. **Create API Key:**
   - Click on "Get API key" in the top right
   - Select "Create API key in new project" or use existing project
   - Copy the generated API key

## 🔧 Step 2: Configure Environment Variables

1. **Add to .env.local:**
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

2. **Restart Development Server:**
   ```bash
   npm run dev
   ```

## 🧪 Step 3: Test the Integration

1. **Test API Connection:**
   - Visit: `http://localhost:3000/api/insights/test`
   - Should return success message if configured correctly

2. **Test Insights Generation:**
   - Visit: `http://localhost:3000/api/insights`
   - Should return financial insights based on your data

## 📁 Files Created

### Backend Files:
- `lib/gemini.js` - Core Gemini API integration
- `app/api/insights/route.js` - Main insights API endpoint
- `app/api/insights/test/route.js` - Test endpoint
- `lib/api.js` - Updated with insights API functions

### Key Features:
- ✅ **Data Processing** - Aggregates financial data for analysis
- ✅ **AI Analysis** - Generates personalized financial insights
- ✅ **Caching** - 24-hour cache to reduce API calls
- ✅ **Error Handling** - Graceful fallbacks if API fails
- ✅ **Rate Limiting** - Built-in protection against abuse

## 🎯 API Endpoints

### GET `/api/insights`
- Returns cached insights if available
- Generates new insights if cache expired
- Handles users with no financial data

### POST `/api/insights`
- Forces refresh of insights
- Clears cache and regenerates analysis

### GET `/api/insights/test`
- Tests Gemini API connection
- Verifies environment configuration

## 🔒 Security & Privacy

- **Data Anonymization**: Personal data is processed securely
- **API Key Protection**: Keys stored in environment variables
- **User Authentication**: All endpoints require user authentication
- **Rate Limiting**: Built-in protection against API abuse

## 💰 Cost Management

- **Caching**: 24-hour cache reduces API calls
- **Efficient Prompts**: Optimized prompts to minimize token usage
- **Error Handling**: Prevents unnecessary API calls on errors

## 🚀 Next Steps

1. **Add API Key** to your environment variables
2. **Test the connection** using the test endpoint
3. **Create UI components** to display insights
4. **Add insights tab** to the navigation

## 🐛 Troubleshooting

### "API key not configured"
- Check your `.env.local` file
- Ensure `GEMINI_API_KEY` is set correctly
- Restart the development server

### "Failed to connect to Gemini API"
- Verify your API key is valid
- Check internet connection
- Ensure you have API quota available

### "No financial data available"
- Add some income/expense entries first
- The system needs data to generate insights

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify your API key configuration
3. Test with the `/api/insights/test` endpoint
4. Ensure you have sufficient API quota

---

**Ready to get started?** Add your API key and test the connection! 🎉 