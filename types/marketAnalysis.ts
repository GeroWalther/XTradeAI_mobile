// Market Analysis Types - moved from marketAnalysisService.ts

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
