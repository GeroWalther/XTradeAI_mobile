import { OPENAI_API_KEY } from '../constants/env';

class AssetComparisonService {
  constructor() {
    this.openaiApiKey = OPENAI_API_KEY;
    this.cache = new Map();
    this.cacheExpiry = 15 * 60 * 1000; // 15 minutes cache for comparison data
  }

  // Get asset map - focused on indices, comprehensive forex, commodities, and crypto
  getAssetMap() {
    return {
      // Indices (Single NASDAQ only)
      nasdaq: '^IXIC',
      's&p500': '^GSPC',
      dow: '^DJI',
      dax: '^GDAXI',
      nikkei: '^N225',
      ftse100: '^FTSE',

      // Major Forex Pairs (USD-based)
      'usd/jpy': 'JPY=X',
      'eur/usd': 'EURUSD=X',
      'gbp/usd': 'GBP=X',
      'usd/cad': 'CAD=X',
      'aud/usd': 'AUD=X',
      'nzd/usd': 'NZD=X',
      'usd/chf': 'CHF=X',

      // Cross Currency Pairs (No USD)
      'eur/jpy': 'EURJPY=X',
      'gbp/jpy': 'GBPJPY=X',
      'aud/jpy': 'AUDJPY=X',
      'cad/jpy': 'CADJPY=X',
      'chf/jpy': 'CHFJPY=X',
      'nzd/jpy': 'NZDJPY=X',
      'eur/gbp': 'EURGBP=X',
      'eur/chf': 'EURCHF=X',
      'eur/cad': 'EURCAD=X',
      'eur/aud': 'EURAUD=X',
      'eur/nzd': 'EURNZD=X',
      'gbp/chf': 'GBPCHF=X',
      'gbp/cad': 'GBPCAD=X',
      'gbp/aud': 'GBPAUD=X',
      'gbp/nzd': 'GBPNZD=X',
      'aud/cad': 'AUDCAD=X',
      'aud/chf': 'AUDCHF=X',
      'aud/nzd': 'AUDNZD=X',
      'cad/chf': 'CADCHF=X',
      'nzd/cad': 'NZDCAD=X',
      'nzd/chf': 'NZDCHF=X',

      // Emerging Market Currencies
      'usd/mxn': 'MXN=X',
      'usd/brl': 'BRL=X',
      'usd/zar': 'ZAR=X',
      'usd/inr': 'INR=X',
      'usd/krw': 'KRW=X',
      'usd/sgd': 'SGD=X',
      'usd/hkd': 'HKD=X',
      'usd/cny': 'CNY=X',

      // Commodities
      gold: 'GC=F',
      silver: 'SI=F',
      'crude oil': 'CL=F',
      'brent oil': 'BZ=F',
      palladium: 'PA=F',
      platinum: 'PL=F',
      copper: 'HG=F',
      'natural gas': 'NG=F',

      // Cryptocurrencies
      bitcoin: 'BTC-USD',
      ethereum: 'ETH-USD',
      solana: 'SOL-USD',
      cardano: 'ADA-USD',
      polkadot: 'DOT-USD',
      ripple: 'XRP-USD',
      litecoin: 'LTC-USD',
      chainlink: 'LINK-USD',
    };
  }

  // Get Yahoo Finance symbol
  getYahooSymbol(asset) {
    const assetMap = this.getAssetMap();
    return assetMap[asset.toLowerCase()] || asset.toUpperCase();
  }

  // Fetch market data for a single asset
  async fetchAssetData(asset) {
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

      if (!response.ok) {
        throw new Error(
          `Yahoo Finance API returned status code ${response.status}`
        );
      }

      const data = await response.json();

      if (data.chart && data.chart.result && data.chart.result.length > 0) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];

        // Calculate additional metrics for comparison
        const currentPrice =
          meta.regularMarketPrice || quote.close[quote.close.length - 1];
        const previousClose = meta.previousClose;
        const dayChange = currentPrice - previousClose;
        const dayChangePercent = (dayChange / previousClose) * 100;

        // Calculate volatility (standard deviation of last 20 periods if available)
        let volatility = 0;
        if (quote.close && quote.close.length >= 20) {
          const last20 = quote.close.slice(-20);
          const mean =
            last20.reduce((sum, price) => sum + price, 0) / last20.length;
          const variance =
            last20.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
            last20.length;
          volatility = (Math.sqrt(variance) / mean) * 100; // Coefficient of variation as percentage
        }

        return {
          asset: asset,
          symbol: yahooSymbol,
          name: meta.longName || meta.shortName || asset,
          current_price: currentPrice,
          previous_close: previousClose,
          day_change: dayChange,
          day_change_percent: dayChangePercent,
          day_high: meta.regularMarketDayHigh,
          day_low: meta.regularMarketDayLow,
          volume: meta.regularMarketVolume,
          volatility: volatility,
          exchange: meta.exchangeName,
          currency: meta.currency,
          marketCap: meta.marketCap,
          error: false,
        };
      } else {
        return {
          asset: asset,
          error: true,
          message: `No data available for ${asset}`,
        };
      }
    } catch (error) {
      console.error(`Error fetching data for ${asset}:`, error);
      return {
        asset: asset,
        error: true,
        message: `Error fetching data: ${error.message}`,
      };
    }
  }

  // Fetch data for multiple assets in parallel
  async fetchMultipleAssetData(assets) {
    try {
      console.log(`Fetching data for ${assets.length} assets...`);

      const promises = assets.map((asset) => this.fetchAssetData(asset));
      const results = await Promise.all(promises);

      const validResults = results.filter((result) => !result.error);
      const errorResults = results.filter((result) => result.error);

      if (errorResults.length > 0) {
        console.warn(
          `Failed to fetch data for: ${errorResults
            .map((r) => r.asset)
            .join(', ')}`
        );
      }

      if (validResults.length === 0) {
        throw new Error('No valid asset data could be fetched');
      }

      return validResults;
    } catch (error) {
      console.error('Error fetching multiple asset data:', error);
      throw error;
    }
  }

  // Get available assets by category (stocks removed, comprehensive forex added)
  getAvailableAssets() {
    const assetMap = this.getAssetMap();
    const assets = Object.keys(assetMap);

    return {
      Indices: assets.filter((asset) =>
        ['nasdaq', 's&p500', 'dow', 'dax', 'nikkei', 'ftse100'].includes(asset)
      ),
      Forex: assets.filter((asset) => asset.includes('/')),
      Commodities: assets.filter((asset) =>
        [
          'gold',
          'silver',
          'crude oil',
          'brent oil',
          'palladium',
          'platinum',
          'copper',
          'natural gas',
        ].includes(asset)
      ),
      Cryptocurrencies: assets.filter((asset) =>
        [
          'bitcoin',
          'ethereum',
          'solana',
          'cardano',
          'polkadot',
          'ripple',
          'litecoin',
          'chainlink',
        ].includes(asset)
      ),
    };
  }

  // Main asset comparison function using AI
  async compareAssets(
    selectedAssets,
    tradingTimeframe = 'short-term',
    riskTolerance = 'moderate'
  ) {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      if (!selectedAssets || selectedAssets.length < 2) {
        throw new Error('Please select at least 2 assets to compare');
      }

      if (selectedAssets.length > 8) {
        throw new Error('Maximum 8 assets can be compared at once');
      }

      // Check cache first
      const cacheKey = `comparison_${selectedAssets
        .sort()
        .join('_')}_${tradingTimeframe}_${riskTolerance}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return {
          status: 'success',
          data: cached.data,
          fromCache: true,
        };
      }

      console.log(
        `Comparing ${selectedAssets.length} assets: ${selectedAssets.join(
          ', '
        )}`
      );

      // Fetch current market data for all assets
      const assetDataArray = await this.fetchMultipleAssetData(selectedAssets);

      // Prepare system message for AI analysis
      const systemMessage = `You are an expert CFD trading analyst with deep knowledge of technical analysis, fundamental analysis, risk management, and market dynamics.

Your task is to analyze and compare the provided assets for CFD trading opportunities and rank them based on their potential for the specified timeframe and risk tolerance.

For each asset, consider:
1. TECHNICAL ANALYSIS: Price action, momentum, trend strength, volatility
2. FUNDAMENTAL FACTORS: Economic drivers, market sentiment, news impact
3. RISK-REWARD RATIO: Potential gains vs potential losses
4. LIKELIHOOD OF SUCCESS: Probability of the trade working out
5. CFD TRADING SUITABILITY: Liquidity, spreads, overnight costs
6. MACROECONOMIC ENVIRONMENT: Global factors affecting the asset
7. CORRELATION RISKS: How assets might move together

Timeframe context:
- Short-term: 1-7 days, focus on technical momentum and news catalysts
- Medium-term: 1-4 weeks, balance technical and fundamental factors
- Long-term: 1-3 months, emphasize fundamentals and macro trends

Risk tolerance context:
- Conservative: Low volatility, high probability setups, smaller risk-reward ratios
- Moderate: Balanced approach, reasonable volatility, good risk-reward ratios
- Aggressive: Higher volatility acceptable, larger risk-reward ratios, speculative plays

Provide your analysis as a JSON object with this exact structure:

{
  "market_overview": "Brief overview of current market conditions affecting these assets",
  "top_recommendations": [
    {
      "rank": 1,
      "asset": "asset_name",
      "recommendation": "LONG/SHORT/AVOID",
      "confidence_score": 85,
      "risk_reward_ratio": "1:2.5",
      "success_probability": "70%",
      "reasoning": "Detailed explanation of why this is the top choice",
      "entry_strategy": "Specific entry points and timing",
      "risk_factors": "Key risks to watch",
      "time_horizon": "Expected time to target"
    }
  ],
  "asset_analysis": {
    "asset_name": {
      "score": 85,
      "technical_outlook": "Bullish/Bearish/Neutral with explanation",
      "fundamental_outlook": "Strong/Weak/Neutral with reasoning",
      "volatility_assessment": "High/Medium/Low",
      "liquidity_rating": "Excellent/Good/Fair/Poor",
      "overnight_cost_impact": "Low/Medium/High",
      "correlation_warnings": "Assets that might move similarly"
    }
  },
  "risk_management": {
    "portfolio_diversification": "Advice on asset selection diversity",
    "position_sizing": "Recommended position sizes relative to portfolio",
    "correlation_matrix": "How selected assets correlate with each other",
    "market_timing": "Best times to enter these trades"
  },
  "summary": "Concise summary with top 3 picks and key market themes"
}

IMPORTANT: 
- Rank all provided assets from best to worst opportunity
- Be specific about entry strategies and risk management
- Consider CFD-specific factors like spreads and overnight financing
- Provide realistic success probabilities and risk-reward ratios
- Your response MUST be valid JSON`;

      // Prepare market data summary for AI
      const marketDataSummary = assetDataArray
        .map((asset) => {
          return `${asset.asset.toUpperCase()}:
- Current Price: ${asset.current_price} ${asset.currency}
- Day Change: ${asset.day_change_percent.toFixed(2)}%
- Volatility: ${asset.volatility.toFixed(2)}%
- Volume: ${asset.volume?.toLocaleString() || 'N/A'}
- Exchange: ${asset.exchange}`;
        })
        .join('\n\n');

      const userMessage = `Please analyze and compare these ${
        selectedAssets.length
      } assets for CFD trading:

ASSETS TO COMPARE: ${selectedAssets.join(', ')}
TRADING TIMEFRAME: ${tradingTimeframe}
RISK TOLERANCE: ${riskTolerance}

CURRENT MARKET DATA:
${marketDataSummary}

Based on this data and your market knowledge, provide a comprehensive comparison and ranking of these assets for CFD trading opportunities. Focus on identifying the best risk-adjusted opportunities given the specified timeframe and risk tolerance.

Format your response as the specified JSON object.`;

      // Make OpenAI API call
      console.log('Sending asset comparison request to OpenAI API...');
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
            temperature: 0.3,
            max_tokens: 2500,
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
      console.log('Received asset comparison response from OpenAI API');

      // Parse the JSON response
      const analysisJson = JSON.parse(responseData.choices[0].message.content);

      // Add metadata
      const finalData = {
        ...analysisJson,
        raw_market_data: assetDataArray,
        comparison_params: {
          assets: selectedAssets,
          timeframe: tradingTimeframe,
          risk_tolerance: riskTolerance,
          generated_at: new Date().toISOString(),
          model: 'gpt-4o',
          asset_count: selectedAssets.length,
        },
        disclaimer:
          'This analysis is for educational purposes only. CFD trading carries significant risk of loss. Always use proper risk management and never risk more than you can afford to lose.',
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: finalData,
        timestamp: Date.now(),
      });

      return {
        status: 'success',
        data: finalData,
        fromCache: false,
      };
    } catch (error) {
      console.error('Asset comparison error:', error);
      return {
        status: 'error',
        message: error.message || 'Asset comparison failed',
      };
    }
  }

  // Helper method to get trading timeframe options
  getTradingTimeframes() {
    return ['short-term', 'medium-term', 'long-term'];
  }

  // Helper method to get risk tolerance options
  getRiskToleranceOptions() {
    return ['conservative', 'moderate', 'aggressive'];
  }

  // Clear cache method
  clearCache() {
    this.cache.clear();
    console.log('Asset comparison cache cleared');
  }
}

export default new AssetComparisonService();
