// This file is unused since we are using the OpenAI API directly now.
import apiClient from './api';
// import { API_ENDPOINTS } from '../constants/env';
import { ApiResponse } from '../types/api';

// Interface for market analysis request payload
export interface MarketAnalysisRequest {
  asset: string;
  term: string;
  riskLevel: string;
}

// Interface for trading strategy
export interface TradingStrategy {
  direction: 'LONG' | 'SHORT';
  rationale: string;
  entry: {
    price: string;
    rationale: string;
  };
  stop_loss: {
    price: string;
    rationale: string;
  };
  take_profit_1: {
    price: string;
    rationale: string;
  };
  take_profit_2: {
    price: string;
    rationale: string;
  };
}

// Interface for market analysis response
export interface MarketAnalysis {
  meta?: {
    generated_at?: string;
    model?: string;
    note?: string;
    asset?: string;
  };
  market_summary: string;
  key_drivers: string[];
  technical_analysis: string;
  risk_assessment: string;
  trading_strategy: TradingStrategy;
  current_market_price?: string | number;
  mock?: boolean;
}

// Hardcoded endpoint
const ANALYSIS_ENDPOINT = '/api/advanced-market-analysis';

// Get market analysis
export const advancedMarketAnalysis = async (
  asset: string,
  term: string,
  riskLevel: string
): Promise<{
  status: string;
  data?: MarketAnalysis;
  message?: string;
  mock?: boolean;
  isRateLimit?: boolean;
}> => {
  try {
    console.log('Starting market analysis request...');
    console.log('Endpoint:', ANALYSIS_ENDPOINT);
    console.log('Request payload:', { asset, term, riskLevel });

    const response = await apiClient.post<ApiResponse<MarketAnalysis>>(
      ANALYSIS_ENDPOINT,
      { asset, term, riskLevel }
    );

    console.log('Raw response:', response.data);

    return {
      status: 'success',
      data: response.data.data,
      mock: response.data.data.mock || false,
    };
  } catch (error: any) {
    console.error('Market analysis error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Check for rate limit errors
    const isRateLimit =
      error.response?.status === 429 ||
      (error.response?.data?.message &&
        error.response?.data?.message.includes('Rate limit exceeded'));

    return {
      status: 'error',
      message:
        error.response?.data?.message ||
        error.message ||
        'Failed to analyze market',
      isRateLimit,
    };
  }
};
