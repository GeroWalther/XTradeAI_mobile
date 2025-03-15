import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import {
  advancedMarketAnalysis,
  MarketAnalysis,
  TradingStrategy,
} from '../services/marketAnalysisService';

// Interface for price validation result
interface PriceValidation {
  isValid: boolean;
  message: string;
  currentMarketPrice: number;
}

export const useMarketAnalysis = () => {
  const [isMockData, setIsMockData] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceValidation, setPriceValidation] =
    useState<PriceValidation | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestPendingRef = useRef(false);

  const queryClient = useQueryClient();

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Start cooldown timer function
  const startCooldown = (seconds = 60) => {
    setCooldownActive(true);
    setCooldownTime(seconds);

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setCooldownTime((prevTime) => {
        if (prevTime <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
          }
          setCooldownActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Validate if the trading strategy makes sense given current market prices
  const validatePricePoints = (
    strategy: TradingStrategy,
    currentMarketPrice: number
  ): PriceValidation | null => {
    if (!strategy || !currentMarketPrice) return null;

    // Parse price strings to numbers for comparison
    const entryPrice = parseFloat(strategy.entry.price.replace(/,/g, ''));
    const stopLossPrice = parseFloat(
      strategy.stop_loss.price.replace(/,/g, '')
    );
    const takeProfit1Price = parseFloat(
      strategy.take_profit_1.price.replace(/,/g, '')
    );
    const takeProfit2Price = parseFloat(
      strategy.take_profit_2.price.replace(/,/g, '')
    );

    // Calculate percentage differences
    const entryDiff =
      ((entryPrice - currentMarketPrice) / currentMarketPrice) * 100;

    let validationMessage = '';
    let isValid = true;

    // Check if entry point is realistic (within 5% of current price)
    if (Math.abs(entryDiff) > 5) {
      validationMessage += `Entry price (${strategy.entry.price}) is ${Math.abs(
        entryDiff
      ).toFixed(2)}% ${
        entryDiff < 0 ? 'below' : 'above'
      } current market price. `;
      isValid = false;
    }

    // For LONG strategy
    if (strategy.direction === 'LONG') {
      // Stop loss should be below entry
      if (stopLossPrice >= entryPrice) {
        validationMessage +=
          'For a LONG position, stop loss should be below entry price. ';
        isValid = false;
      }

      // Take profits should be above entry
      if (takeProfit1Price <= entryPrice) {
        validationMessage +=
          'For a LONG position, take profit targets should be above entry price. ';
        isValid = false;
      }
    }
    // For SHORT strategy
    else if (strategy.direction === 'SHORT') {
      // Stop loss should be above entry
      if (stopLossPrice <= entryPrice) {
        validationMessage +=
          'For a SHORT position, stop loss should be above entry price. ';
        isValid = false;
      }

      // Take profits should be below entry
      if (takeProfit1Price >= entryPrice) {
        validationMessage +=
          'For a SHORT position, take profit targets should be below entry price. ';
        isValid = false;
      }
    }

    return {
      isValid,
      message:
        validationMessage ||
        'Price points appear valid based on current market conditions.',
      currentMarketPrice,
    };
  };

  // Use React Query's useMutation for the analysis request
  const marketAnalysisMutation = useMutation({
    mutationFn: async ({
      asset,
      term,
      riskLevel,
    }: {
      asset: string;
      term: string;
      riskLevel: string;
    }) => {
      // Prevent multiple requests
      if (isRequestPendingRef.current || cooldownActive) {
        throw new Error('Request already in progress or cooldown active');
      }

      isRequestPendingRef.current = true;

      try {
        // Reset states
        setIsMockData(false);
        setPriceValidation(null);
        setCurrentPrice(null);

        console.log(
          `Starting market analysis for ${asset} (${term}, ${riskLevel})...`
        );

        // Call the advanced market analysis service
        const result = await advancedMarketAnalysis(asset, term, riskLevel);

        if (result.status === 'success' && result.data) {
          console.log('Full analysis data:', result.data);

          // Check if this is mock data
          if (result.mock) {
            setIsMockData(true);
            console.log('Displaying mock data');
          }

          // Get current price from the response
          if (result.data.current_market_price) {
            const price = result.data.current_market_price;
            console.log(
              `Current ${asset} price from backend:`,
              price,
              typeof price
            );

            // Ensure price is a number
            const numericPrice =
              typeof price === 'string'
                ? parseFloat(price.replace(/,/g, ''))
                : price;
            console.log('Numeric price:', numericPrice);

            if (!isNaN(numericPrice)) {
              setCurrentPrice(numericPrice);

              // Validate the strategy against the current price
              const validation = validatePricePoints(
                result.data.trading_strategy,
                numericPrice
              );
              if (validation) {
                setPriceValidation(validation);
              }
            }
          }

          return result.data;
        } else {
          // Handle error from backend
          console.error('Error from backend:', result.message);

          // If there's a specific error about rate limiting or market data
          if (
            result.isRateLimit ||
            (result.message && result.message.includes('Rate limit exceeded'))
          ) {
            // Start a cooldown timer to prevent further requests
            startCooldown(60);
            throw new Error(
              'Yahoo Finance API rate limit exceeded. Please try again in 60 seconds.'
            );
          } else if (result.message && result.message.includes('market data')) {
            throw new Error(
              'Unable to fetch current market data. Please try again later.'
            );
          }

          throw new Error(result.message || 'Failed to analyze market');
        }
      } finally {
        isRequestPendingRef.current = false;
      }
    },
    onError: (error: Error) => {
      console.error('Error in market analysis mutation:', error);
    },
  });

  return {
    analyzeMarket: marketAnalysisMutation.mutate,
    isLoading: marketAnalysisMutation.isPending,
    isError: marketAnalysisMutation.isError,
    error: marketAnalysisMutation.error,
    data: marketAnalysisMutation.data,
    isMockData,
    currentPrice,
    priceValidation,
    cooldownActive,
    cooldownTime,
    reset: marketAnalysisMutation.reset,
  };
};
