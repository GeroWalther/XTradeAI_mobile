import { OPENAI_API_KEY } from '../constants/env';

class AdvancedMarketAnalysisService {
  constructor() {
    this.openaiApiKey = OPENAI_API_KEY;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Fetch market data from Yahoo Finance
  async fetchMarketData(asset) {
    try {
      const yahooSymbol = this.getYahooSymbol(asset);
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.chart && data.chart.result && data.chart.result.length > 0) {
          const result = data.chart.result[0];
          const meta = result.meta;
          const quote = result.indicators.quote[0];

          return {
            current_price:
              meta.regularMarketPrice || quote.close[quote.close.length - 1],
            previous_close: meta.previousClose,
            day_high: meta.regularMarketDayHigh,
            day_low: meta.regularMarketDayLow,
            volume: meta.regularMarketVolume,
            exchange: meta.exchangeName,
            currency: meta.currency,
            symbol: meta.symbol,
            error: false,
          };
        } else {
          return {
            error: true,
            message: `No data available for ${asset}`,
            status_code: 404,
          };
        }
      } else {
        return {
          error: true,
          message: `Yahoo Finance API returned status code ${response.status}`,
          status_code: response.status,
        };
      }
    } catch (error) {
      console.error(`Error fetching market data for ${asset}:`, error);
      return {
        error: true,
        message: `Error fetching market data: ${error.message}`,
        status_code: 500,
      };
    }
  }

  // Convert asset name to Yahoo Finance symbol
  getYahooSymbol(asset) {
    const assetMap = {
      // Indices
      nasdaq: '^IXIC',
      nasdaq100: '^NDX',
      's&p500': '^GSPC',
      dow: '^DJI',
      dax: '^GDAXI',
      nikkei: '^N225',
      ftse100: '^FTSE',

      // Forex Pairs
      'usd/jpy': 'JPY=X',
      'eur/usd': 'EURUSD=X',
      'gbp/usd': 'GBP=X',
      'usd/cad': 'CAD=X',
      'aud/usd': 'AUD=X',
      'nzd/usd': 'NZD=X',
      'usd/chf': 'CHF=X',
      'eur/jpy': 'EURJPY=X',
      'gbp/jpy': 'GBPJPY=X',
      'eur/gbp': 'EURGBP=X',
      'eur/chf': 'EURCHF=X',

      // Commodities
      gold: 'GC=F',
      silver: 'SI=F',
      'crude oil': 'CL=F',
      'brent oil': 'BZ=F',
      palladium: 'PA=F',
      platinum: 'PL=F',
      copper: 'HG=F',

      // Cryptocurrencies
      bitcoin: 'BTC-USD',
      ethereum: 'ETH-USD',
      solana: 'SOL-USD',
      cardano: 'ADA-USD',
      polkadot: 'DOT-USD',
      ripple: 'XRP-USD',

      // Major Stocks
      apple: 'AAPL',
      microsoft: 'MSFT',
      amazon: 'AMZN',
      tesla: 'TSLA',
      meta: 'META',
      google: 'GOOGL',
      nvidia: 'NVDA',
      netflix: 'NFLX',
      disney: 'DIS',
      mcdonalds: 'MCD',
      'coca cola': 'KO',
      pepsi: 'PEP',
      visa: 'V',
      mastercard: 'MA',
      jpmorgan: 'JPM',
      'bank of america': 'BAC',
      walmart: 'WMT',
      'home depot': 'HD',
      'procter & gamble': 'PG',
    };

    return assetMap[asset.toLowerCase()] || asset.toUpperCase();
  }

  // Get asset URLs for reference
  getAssetUrls(asset) {
    const assetUrls = {
      // Indices
      nasdaq: {
        yahoo: 'https://finance.yahoo.com/quote/%5EIXIC/',
        tradingview:
          'https://www.tradingview.com/symbols/NASDAQ-IXIC/technicals/',
      },
      nasdaq100: {
        yahoo: 'https://finance.yahoo.com/quote/%5ENDX/',
        tradingview:
          'https://www.tradingview.com/symbols/NASDAQ-NDX/technicals/',
      },
      's&p500': {
        yahoo: 'https://finance.yahoo.com/quote/%5EGSPC/',
        tradingview: 'https://www.tradingview.com/symbols/SPX/technicals/',
      },
      // ... (include all the asset URLs from your server code)
    };

    const assetLower = asset.toLowerCase();
    return {
      yahoo: assetUrls[assetLower]?.yahoo || 'https://finance.yahoo.com/',
      tradingview:
        assetUrls[assetLower]?.tradingview || 'https://www.tradingview.com/',
    };
  }

  // Main analysis function
  async advancedMarketAnalysis(asset, term, riskLevel) {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      if (!asset || !term || !riskLevel) {
        throw new Error(
          'Missing required parameters: asset, term, and riskLevel are required'
        );
      }

      // Fetch current market data
      console.log(`Fetching market data for ${asset}...`);
      const marketData = await this.fetchMarketData(asset);

      if (marketData.error) {
        throw new Error(marketData.message);
      }

      console.log(
        `Successfully fetched market data. Current price: ${marketData.current_price}`
      );

      // Get asset URLs
      const urls = this.getAssetUrls(asset);

      // Prepare system message
      const systemMessage = `You are an expert financial analyst and trader with deep knowledge of markets, technical analysis, and trading strategies.
Your task is to analyze ${asset} and provide a comprehensive trading strategy for a ${term} with ${riskLevel} risk level.

IMPORTANT: You should actively search for current information about ${asset}, including:

1. CURRENT MARKET DATA:
   - Look up the latest price data on Yahoo Finance: ${urls.yahoo}
   - Find current price, volume, and basic indicators

2. TECHNICAL ANALYSIS:
   - Check TradingView: ${urls.tradingview}
   - Research current RSI, MACD, Moving Averages, and support/resistance levels

3. RECENT NEWS:
   - Search for latest news about the asset on financial news sites
   - Look for news from the past 7 days that could impact the asset

4. MACROECONOMIC DATA:
   - Check for recent economic data releases
   - Research Fed announcements, inflation data, employment reports, etc.

5. MARKET SENTIMENT:
   - Look for recent analyst opinions and market sentiment
   - Check Twitter/X for market commentary from respected analysts

After gathering this information, analyze it and provide a comprehensive trading strategy.
Format your response as a JSON object with the following structure:

{
    "market_summary": "Comprehensive summary of current market conditions based on your research",
    "key_drivers": ["List of key market drivers and factors from your research"],
    "technical_analysis": "Detailed technical analysis with key indicators you found",
    "risk_assessment": "Assessment of market risks based on current data",
    "trading_strategy": {
        "direction": "LONG or SHORT",
        "rationale": "Explanation of the strategy direction based on your research",
        "entry": {
            "price": "Recommended entry price or range",
            "rationale": "Rationale for entry point"
        },
        "stop_loss": {
            "price": "Recommended stop loss price",
            "rationale": "Rationale for stop loss placement"
        },
        "take_profit_1": {
            "price": "First take profit target",
            "rationale": "Rationale for TP1"
        },
        "take_profit_2": {
            "price": "Second take profit target",
            "rationale": "Rationale for TP2"
        }
    }
}

Your response MUST be a valid JSON object with this exact structure.

IMPORTANT: 
- Make sure your price targets are realistic and close to the current market price
- Entry points should be within reasonable range of current price based on term
- Include specific data points and findings from your research
- Entry points MUST be within specified percentage range of current price:
  - Day trades: Entry MUST be within 0.5-1% of current price
  - Swing trades: Entry MUST be within 1-3% of current price
  - Position trades: Entry MUST be within 3-7% of current price`;

      // Prepare user message with market data
      const termDescriptions = {
        'day trade':
          'very short-term (1-2 days) with entries within 0.5-1% of current price',
        'swing trade':
          'short to medium-term (1-2 weeks) with entries within 1-3% of current price',
        'position trade':
          'medium to long-term (1-3 months) with entries within 3-7% of current price',
      };

      const riskLevelDescriptions = {
        conservative:
          'conservative (prioritizing capital preservation with modest returns) with a risk to reward ratio of 1:1.2',
        moderate:
          'moderate (balanced approach between risk and reward) with a risk to reward ratio of 1:1.8',
        aggressive:
          'aggressive (higher risk tolerance for potentially higher returns) with a risk to reward ratio of 1:2.8',
      };

      const termDesc = termDescriptions[term.toLowerCase()] || term;
      const riskDesc =
        riskLevelDescriptions[riskLevel.toLowerCase()] || riskLevel;

      const userMessage = `Please provide an advanced market analysis and trading strategy for:

Asset: ${asset}
Trading Term: ${term} (${termDesc})
Risk Level: ${riskLevel} (${riskDesc})

Current Market Data:
- Current Price: ${marketData.current_price}
- Previous Close: ${marketData.previous_close}
- Day High: ${marketData.day_high}
- Day Low: ${marketData.day_low}
- Volume: ${marketData.volume}
- Exchange: ${marketData.exchange}

Based on this data and your research, develop a detailed ${termDesc} trading strategy with ${riskDesc} risk profile.
Please format your response as the specified JSON object.`;

      // Make OpenAI API call
      console.log('Sending request to OpenAI API...');
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemMessage },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.2,
            max_tokens: 1500,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `OpenAI API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const responseData = await response.json();
      console.log('Received response from OpenAI API');

      // Parse the JSON response
      const analysisJson = JSON.parse(responseData.choices[0].message.content);

      // Add current market price and metadata
      analysisJson.current_market_price = marketData.current_price;
      analysisJson.meta = {
        generated_at: new Date().toISOString(),
        model: 'gpt-4o',
        asset: asset,
        term: term,
        risk_level: riskLevel,
        note: 'This analysis includes real-time market data and AI-generated insights.',
      };

      return {
        status: 'success',
        data: analysisJson,
      };
    } catch (error) {
      console.error('Advanced market analysis error:', error);
      return {
        status: 'error',
        message: error.message || 'Analysis failed',
      };
    }
  }
}

export default new AdvancedMarketAnalysisService();
