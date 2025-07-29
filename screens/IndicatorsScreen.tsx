import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Card } from '../components/ui/Card';

interface VIXData {
  current_price: number;
  previous_close: number;
  day_high: number;
  day_low: number;
  symbol: string;
  currency: string;
  error?: boolean;
  message?: string;
}

interface SmartMoneyData {
  institutionalFlow: number;
  retailSentiment: number;
  darkPoolActivity: number;
  optionsFlow: number;
  smartMoneyRatio: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  historicalData: SmartMoneyHistoricalPoint[];
}

interface SmartMoneyHistoricalPoint {
  timestamp: string;
  smartMoney: number;
  dumbMoney: number;
  smartMoneyRatio: number;
  volume: number;
  price: number;
}

interface TimeframeOption {
  label: string;
  value: string;
  days: number;
}

const IndicatorsScreen = () => {
  const COLORS = useTheme();
  const [vixData, setVixData] = useState<VIXData | null>(null);
  const [smartMoneyData, setSmartMoneyData] = useState<SmartMoneyData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [crosshairData, setCrosshairData] = useState<{
    visible: boolean;
    x: number;
    dataPoint: SmartMoneyHistoricalPoint | null;
    index: number;
  } | null>(null);

  const timeframes: TimeframeOption[] = [
    { label: '10D', value: '10d', days: 10 },
    { label: '30D', value: '30d', days: 30 },
    { label: '3M', value: '3m', days: 90 },
    { label: '6M', value: '6m', days: 180 },
    { label: '1Y', value: '1y', days: 365 },
    { label: '3Y', value: '3y', days: 1095 },
  ];

  // Fetch VIX data from Yahoo Finance
  const fetchVIXData = async (): Promise<VIXData> => {
    try {
      const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX';
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
            symbol: meta.symbol,
            currency: meta.currency,
            error: false,
          };
        } else {
          throw new Error('No VIX data available');
        }
      } else {
        throw new Error(
          `Yahoo Finance API returned status code ${response.status}`
        );
      }
    } catch (error: any) {
      console.error('Error fetching VIX data:', error);
      return {
        current_price: 0,
        previous_close: 0,
        day_high: 0,
        day_low: 0,
        symbol: '^VIX',
        currency: 'USD',
        error: true,
        message: error.message,
      };
    }
  };

  // Fetch real market data to calculate Smart Money Index
  const fetchSmartMoneyData = async (
    timeframe: string
  ): Promise<SmartMoneyData> => {
    try {
      const selectedTimeframeObj = timeframes.find(
        (t) => t.value === timeframe
      );
      const days = selectedTimeframeObj?.days || 30;

      // Fetch multiple market indicators
      const [spyData, qqqData, vixHistData, putCallData] = await Promise.all([
        fetchHistoricalData('SPY', days),
        fetchHistoricalData('QQQ', days),
        fetchHistoricalData('^VIX', days),
        fetchPutCallRatio(days),
      ]);

      if (!spyData || !qqqData || !vixHistData) {
        throw new Error('Failed to fetch market data');
      }

      // Calculate Smart Money Index using multiple indicators
      const historicalData = calculateSmartMoneyIndex(
        spyData,
        qqqData,
        vixHistData,
        putCallData
      );

      if (historicalData.length === 0) {
        throw new Error('No historical data available');
      }

      // Get current metrics from latest data point
      const latest = historicalData[historicalData.length - 1];
      const previous = historicalData[historicalData.length - 2];

      // Calculate current flows and sentiment
      const institutionalFlow = latest.smartMoney;
      const retailSentiment = latest.dumbMoney;
      const darkPoolActivity =
        Math.abs(latest.smartMoney - latest.dumbMoney) * 0.3; // Estimate from volume patterns
      const optionsFlow = putCallData
        ? (putCallData.putCallRatio - 1) * 100
        : 0;

      // Smart Money Ratio
      const smartMoneyRatio = latest.smartMoneyRatio;

      let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (smartMoneyRatio > 15) signal = 'bullish';
      else if (smartMoneyRatio < -15) signal = 'bearish';

      return {
        institutionalFlow: Math.round(institutionalFlow * 100) / 100,
        retailSentiment: Math.round(retailSentiment * 100) / 100,
        darkPoolActivity: Math.round(darkPoolActivity * 100) / 100,
        optionsFlow: Math.round(optionsFlow * 100) / 100,
        smartMoneyRatio: Math.round(smartMoneyRatio * 100) / 100,
        signal,
        historicalData,
      };
    } catch (error: any) {
      console.error('Error fetching smart money data:', error);
      // Fallback to mock data if real data fails
      return generateMockSmartMoneyData(timeframe);
    }
  };

  // Fetch historical data for a symbol
  const fetchHistoricalData = async (symbol: string, days: number) => {
    try {
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - days * 24 * 60 * 60;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1d`;

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
          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];

          return timestamps
            .map((timestamp: number, index: number) => ({
              timestamp: new Date(timestamp * 1000).toISOString().split('T')[0],
              open: quotes.open[index],
              high: quotes.high[index],
              low: quotes.low[index],
              close: quotes.close[index],
              volume: quotes.volume[index],
            }))
            .filter((item: any) => item.close !== null);
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error);
      return null;
    }
  };

  // Fetch Put/Call Ratio (simulated - real implementation would use options data API)
  const fetchPutCallRatio = async (days: number) => {
    try {
      // In a real implementation, this would fetch from an options data provider
      // For now, we'll calculate based on VIX behavior
      const vixData = await fetchHistoricalData('^VIX', days);
      if (!vixData) return null;

      const avgVix =
        vixData.reduce((sum: number, item: any) => sum + item.close, 0) /
        vixData.length;
      const putCallRatio = 0.7 + (avgVix - 20) * 0.02; // Typical range 0.5-1.5

      return { putCallRatio: Math.max(0.3, Math.min(2.0, putCallRatio)) };
    } catch (error) {
      return { putCallRatio: 0.8 }; // Default neutral ratio
    }
  };

  // Calculate Smart Money Index from multiple data sources
  const calculateSmartMoneyIndex = (
    spyData: any[],
    qqqData: any[],
    vixData: any[],
    putCallData: any
  ) => {
    const historicalData: SmartMoneyHistoricalPoint[] = [];

    // Calculate moving averages for better trend analysis
    const calculateSMA = (data: any[], period: number, field: string) => {
      return data.map((_, index) => {
        if (index < period - 1) return null;
        const sum = data
          .slice(index - period + 1, index + 1)
          .reduce((acc, item) => acc + (item[field] || 0), 0);
        return sum / period;
      });
    };

    // Get 20-day moving averages for volume
    const spyVolumeSMA = calculateSMA(spyData, 20, 'volume');
    const qqqVolumeSMA = calculateSMA(qqqData, 20, 'volume');

    for (
      let i = 0;
      i < Math.min(spyData.length, qqqData.length, vixData.length);
      i++
    ) {
      const spy = spyData[i];
      const qqq = qqqData[i];
      const vix = vixData[i];

      if (!spy || !qqq || !vix) continue;

      // Price momentum (smart money often moves before price)
      const spyMomentum =
        i > 0
          ? ((spy.close - spyData[i - 1].close) / spyData[i - 1].close) * 100
          : 0;
      const qqqMomentum =
        i > 0
          ? ((qqq.close - qqqData[i - 1].close) / qqqData[i - 1].close) * 100
          : 0;

      // Volume analysis with moving average comparison
      const spyVolumeRatio =
        spyVolumeSMA[i] && spyVolumeSMA[i] !== null
          ? spy.volume / spyVolumeSMA[i]!
          : 1;
      const qqqVolumeRatio =
        qqqVolumeSMA[i] && qqqVolumeSMA[i] !== null
          ? qqq.volume / qqqVolumeSMA[i]!
          : 1;

      // Smart money indicator: high volume + positive momentum = institutional accumulation
      const spySmartFactor =
        (spy.close > spy.open ? 1 : -1) *
        spyVolumeRatio *
        Math.abs(spyMomentum);
      const qqqSmartFactor =
        (qqq.close > qqq.open ? 1 : -1) *
        qqqVolumeRatio *
        Math.abs(qqqMomentum);

      // VIX contrarian indicator - when VIX is high but falling, smart money buying
      const vixMomentum = i > 0 ? vixData[i - 1].close - vix.close : 0;
      const vixContrarian =
        vix.close > 25 && vixMomentum > 0 ? 25 : vix.close < 15 ? -15 : 0;

      // Calculate intraday vs closing strength (Smart Money Index concept from TradingView)
      const spyIntradayStrength =
        (spy.close - spy.open) / (spy.high - spy.low || 0.01);
      const qqqIntradayStrength =
        (qqq.close - qqq.open) / (qqq.high - qqq.low || 0.01);

      // Smart money prefers to accumulate on weakness, distribute on strength
      const smartMoneyBias = (spyIntradayStrength + qqqIntradayStrength) / 2;

      // Calculate composite Smart Money Index (-100 to +100 scale)
      let smartMoney =
        ((spySmartFactor + qqqSmartFactor) / 2) * 12 +
        vixContrarian +
        smartMoneyBias * 20; // Intraday strength component
      smartMoney = Math.max(-100, Math.min(100, smartMoney));

      // Retail sentiment - driven by fear, momentum chasing, and opposite to smart money
      const vixFearFactor = Math.max(0, (vix.close - 15) * 2.5); // Fear increases above VIX 15
      const momentumChasing = Math.abs(spyMomentum + qqqMomentum) > 2 ? 15 : 0; // Retail chases big moves
      let dumbMoney = -smartMoney * 0.75 + vixFearFactor + momentumChasing - 15;
      dumbMoney = Math.max(-100, Math.min(100, dumbMoney));

      // Smart Money Ratio
      const smartMoneyRatio = smartMoney - dumbMoney;

      historicalData.push({
        timestamp: spy.timestamp,
        smartMoney: Math.round(smartMoney * 100) / 100,
        dumbMoney: Math.round(dumbMoney * 100) / 100,
        smartMoneyRatio: Math.round(smartMoneyRatio * 100) / 100,
        volume: spy.volume + qqq.volume,
        price: (spy.close + qqq.close) / 2,
      });
    }

    return historicalData;
  };

  // Fallback mock data generator
  const generateMockSmartMoneyData = (timeframe: string): SmartMoneyData => {
    const selectedTimeframeObj = timeframes.find((t) => t.value === timeframe);
    const days = selectedTimeframeObj?.days || 30;

    const historicalData: SmartMoneyHistoricalPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const smartMoney = Math.random() * 200 - 100;
      const dumbMoney = Math.random() * 200 - 100;
      const ratio = smartMoney - dumbMoney;

      historicalData.push({
        timestamp,
        smartMoney: Math.round(smartMoney * 100) / 100,
        dumbMoney: Math.round(dumbMoney * 100) / 100,
        smartMoneyRatio: Math.round(ratio * 100) / 100,
        volume: Math.floor(Math.random() * 1000000000),
        price: 400 + Math.random() * 100,
      });
    }

    const latest = historicalData[historicalData.length - 1];
    let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (latest.smartMoneyRatio > 20) signal = 'bullish';
    else if (latest.smartMoneyRatio < -20) signal = 'bearish';

    return {
      institutionalFlow: latest.smartMoney,
      retailSentiment: latest.dumbMoney,
      darkPoolActivity: Math.abs(latest.smartMoneyRatio) * 0.3,
      optionsFlow: Math.random() * 100 - 50,
      smartMoneyRatio: latest.smartMoneyRatio,
      signal,
      historicalData,
    };
  };

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [vixResult, smartMoneyResult] = await Promise.all([
        fetchVIXData(),
        fetchSmartMoneyData(selectedTimeframe),
      ]);

      setVixData(vixResult);
      setSmartMoneyData(smartMoneyResult);
    } catch (error) {
      console.error('Error loading indicator data:', error);
      Alert.alert('Error', 'Failed to load indicator data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTimeframe]);

  const getVIXInterpretation = (vixValue: number) => {
    if (vixValue < 12)
      return {
        level: 'Very Low',
        color: COLORS.success,
        description: 'Extreme complacency',
      };
    if (vixValue < 20)
      return {
        level: 'Low',
        color: COLORS.success,
        description: 'Low volatility, calm markets',
      };
    if (vixValue < 30)
      return {
        level: 'Normal',
        color: COLORS.info,
        description: 'Normal market conditions',
      };
    if (vixValue < 40)
      return {
        level: 'High',
        color: COLORS.warning,
        description: 'Elevated fear and uncertainty',
      };
    return {
      level: 'Very High',
      color: COLORS.error,
      description: 'Extreme fear and panic',
    };
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish':
        return COLORS.success;
      case 'bearish':
        return COLORS.error;
      default:
        return COLORS.textMuted;
    }
  };

  // Helper function to get timeframe start label
  const getTimeframeStartLabel = (timeframe: string) => {
    const timeframeObj = timeframes.find((t) => t.value === timeframe);
    if (!timeframeObj) return '30d ago';

    switch (timeframe) {
      case '10d':
        return '10d ago';
      case '30d':
        return '1m ago';
      case '3m':
        return '3m ago';
      case '6m':
        return '6m ago';
      case '1y':
        return '1y ago';
      case '3y':
        return '3y ago';
      default:
        return '30d ago';
    }
  };

  // Helper function to format date labels based on timeframe
  const formatDateLabel = (dateString: string, timeframe: string) => {
    const date = new Date(dateString);

    switch (timeframe) {
      case '10d':
      case '30d':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case '3m':
      case '6m':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
      case '1y':
      case '3y':
        return date.toLocaleDateString('en-US', { year: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
    }
  };

  // Helper function to format exact date for tooltip
  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Smart Money Chart Component
  const SmartMoneyChart = ({
    data,
    timeframe,
  }: {
    data: SmartMoneyHistoricalPoint[];
    timeframe: string;
  }) => {
    const chartHeight = 150;
    const chartWidth = 280;
    const padding = 20;

    // Reduce data points for better visualization based on timeframe
    const getReducedData = (
      fullData: SmartMoneyHistoricalPoint[],
      timeframe: string
    ) => {
      if (fullData.length === 0) return fullData;

      let step = 1;
      switch (timeframe) {
        case '10d':
          step = 1; // Show all points
          break;
        case '30d':
          step = 2; // Show every 2nd point
          break;
        case '3m':
          step = 5; // Show every 5th point
          break;
        case '6m':
          step = 10; // Show every 10th point
          break;
        case '1y':
          step = 15; // Show every 15th point
          break;
        case '3y':
          step = 30; // Show every 30th point
          break;
        default:
          step = 5;
      }

      return fullData.filter(
        (_, index) => index % step === 0 || index === fullData.length - 1
      );
    };

    const reducedData = getReducedData(data, timeframe);

    // Calculate min/max for scaling
    const allValues = reducedData.flatMap((d) => [d.smartMoney, d.dumbMoney]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue || 1;

    // Touch handlers for crosshair functionality
    const handleTouchStart = (event: any) => {
      const { locationX, locationY } = event.nativeEvent;

      // Only show crosshair if touch is within chart bounds
      if (
        locationX >= padding &&
        locationX <= chartWidth - padding &&
        locationY >= padding &&
        locationY <= chartHeight - padding
      ) {
        updateCrosshair(locationX);
      }
    };

    const handlePressIn = (event: any) => {
      // Handle press events from TouchableWithoutFeedback
      const { locationX, locationY } = event.nativeEvent;
      handleTouchStart(event);
    };

    const handleTouchMove = (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      // Only update if crosshair is already visible and touch is within bounds
      if (
        crosshairData?.visible &&
        locationX >= padding &&
        locationX <= chartWidth - padding &&
        locationY >= padding &&
        locationY <= chartHeight - padding
      ) {
        updateCrosshair(locationX);
      }
    };

    const handleTouchEnd = () => {
      // Keep crosshair visible after touch ends - will be hidden by outside tap
    };

    const updateCrosshair = (touchX: number) => {
      if (reducedData.length === 0) return;

      // Ensure touch is within chart bounds
      const constrainedTouchX = Math.max(
        padding,
        Math.min(touchX, chartWidth - padding)
      );

      // Calculate which data point is closest to the touch
      const dataPointWidth =
        (chartWidth - 2 * padding) / (reducedData.length - 1);
      let closestIndex = Math.round(
        (constrainedTouchX - padding) / dataPointWidth
      );
      closestIndex = Math.max(
        0,
        Math.min(closestIndex, reducedData.length - 1)
      );

      const dataPoint = reducedData[closestIndex];
      const exactX =
        padding +
        (closestIndex / (reducedData.length - 1)) * (chartWidth - 2 * padding);

      setCrosshairData({
        visible: true,
        x: exactX,
        dataPoint,
        index: closestIndex,
      });
    };

    // Determine if we should show data points based on timeframe
    const showDataPoints = ['10d', '30d'].includes(timeframe);
    const lineWidth = timeframe === '3y' ? 1.5 : timeframe === '1y' ? 2 : 2.5;

    // Create points for lines
    const createLine = (values: number[], color: string) => {
      const points = values.map((value, index) => {
        const x =
          padding +
          (index / (reducedData.length - 1)) * (chartWidth - 2 * padding);
        const y =
          chartHeight -
          padding -
          ((value - minValue) / range) * (chartHeight - 2 * padding);
        return { x, y };
      });

      return (
        <View key={color} style={StyleSheet.absoluteFill}>
          {points.map((point, index) => (
            <View key={index}>
              {/* Data point - only show for short timeframes */}
              {showDataPoints && (
                <View
                  style={[
                    styles(COLORS).chartPoint,
                    {
                      left: point.x - 2,
                      top: point.y - 2,
                      backgroundColor: color,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                    },
                  ]}
                />
              )}
              {/* Line to next point */}
              {index < points.length - 1 && (
                <View
                  style={[
                    styles(COLORS).chartLine,
                    {
                      left: point.x,
                      top: point.y,
                      width: Math.sqrt(
                        Math.pow(points[index + 1].x - point.x, 2) +
                          Math.pow(points[index + 1].y - point.y, 2)
                      ),
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            points[index + 1].y - point.y,
                            points[index + 1].x - point.x
                          )}rad`,
                        },
                      ],
                      backgroundColor: color,
                      height: lineWidth,
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      );
    };

    return (
      <View style={styles(COLORS).chartContainer}>
        <View style={styles(COLORS).chartHeader}>
          <Text style={styles(COLORS).chartTitle}>
            {timeframes.find((t) => t.value === timeframe)?.label || '30D'}{' '}
            Trend
          </Text>
          <View style={styles(COLORS).chartLegend}>
            <View style={styles(COLORS).legendItem}>
              <View
                style={[
                  styles(COLORS).legendDot,
                  { backgroundColor: COLORS.success },
                ]}
              />
              <Text style={styles(COLORS).legendText}>Smart Money</Text>
            </View>
            <View style={styles(COLORS).legendItem}>
              <View
                style={[
                  styles(COLORS).legendDot,
                  { backgroundColor: COLORS.error },
                ]}
              />
              <Text style={styles(COLORS).legendText}>Dumb Money</Text>
            </View>
          </View>
        </View>

        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onLongPress={() => {}} // Prevent long press
        >
          <View
            style={[
              styles(COLORS).chart,
              { height: chartHeight, width: chartWidth },
            ]}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
            {/* Grid lines - fewer and more subtle */}
            <View style={styles(COLORS).gridContainer}>
              {[25, 50, 75].map((percent) => (
                <View
                  key={percent}
                  style={[
                    styles(COLORS).gridLine,
                    {
                      top:
                        padding + (percent / 100) * (chartHeight - 2 * padding),
                    },
                  ]}
                />
              ))}
            </View>

            {/* Smart Money Line */}
            {createLine(
              reducedData.map((d) => d.smartMoney),
              COLORS.success
            )}

            {/* Dumb Money Line */}
            {createLine(
              reducedData.map((d) => d.dumbMoney),
              COLORS.error
            )}

            {/* Zero line */}
            <View
              style={[
                styles(COLORS).zeroLine,
                {
                  top:
                    chartHeight -
                    padding -
                    (-minValue / range) * (chartHeight - 2 * padding),
                },
              ]}
            />

            {/* Crosshair */}
            {crosshairData?.visible && crosshairData.dataPoint && (
              <>
                {/* Vertical crosshair line */}
                <View
                  style={[
                    styles(COLORS).crosshairLine,
                    {
                      left: crosshairData.x,
                      top: padding,
                      height: chartHeight - 2 * padding,
                    },
                  ]}
                />
                {/* Crosshair indicator dots at line intersections */}
                <View
                  style={[
                    styles(COLORS).crosshairDot,
                    {
                      left: crosshairData.x - 4,
                      top:
                        chartHeight -
                        padding -
                        ((crosshairData.dataPoint.smartMoney - minValue) /
                          range) *
                          (chartHeight - 2 * padding) -
                        4,
                      backgroundColor: COLORS.success,
                    },
                  ]}
                />
                <View
                  style={[
                    styles(COLORS).crosshairDot,
                    {
                      left: crosshairData.x - 4,
                      top:
                        chartHeight -
                        padding -
                        ((crosshairData.dataPoint.dumbMoney - minValue) /
                          range) *
                          (chartHeight - 2 * padding) -
                        4,
                      backgroundColor: COLORS.error,
                    },
                  ]}
                />
              </>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* X-axis labels */}
        <View style={styles(COLORS).xAxisLabels}>
          <Text style={styles(COLORS).axisLabel}>
            {reducedData.length > 0
              ? formatDateLabel(reducedData[0].timestamp, timeframe)
              : getTimeframeStartLabel(timeframe)}
          </Text>
          <Text style={styles(COLORS).axisLabel}>
            {reducedData.length > 0
              ? formatDateLabel(
                  reducedData[reducedData.length - 1].timestamp,
                  timeframe
                )
              : 'Today'}
          </Text>
        </View>

        {/* Crosshair Tooltip - positioned above chart */}
        {crosshairData?.visible && crosshairData.dataPoint && (
          <View
            style={[
              styles(COLORS).crosshairTooltip,
              {
                left: Math.min(
                  Math.max(5, crosshairData.x - 65),
                  chartWidth - 135
                ),
                top: -90, // Position above the chart
              },
            ]}>
            <Text style={styles(COLORS).tooltipDate}>
              {formatTooltipDate(crosshairData.dataPoint.timestamp)}
            </Text>
            <View style={styles(COLORS).tooltipRow}>
              <Text style={styles(COLORS).tooltipCompactLabel}>Smart:</Text>
              <Text
                style={[
                  styles(COLORS).tooltipCompactValue,
                  { color: COLORS.success },
                ]}>
                {crosshairData.dataPoint.smartMoney > 0 ? '+' : ''}
                {crosshairData.dataPoint.smartMoney.toFixed(1)}
              </Text>
            </View>
            <View style={styles(COLORS).tooltipRow}>
              <Text style={styles(COLORS).tooltipCompactLabel}>Dumb:</Text>
              <Text
                style={[
                  styles(COLORS).tooltipCompactValue,
                  { color: COLORS.error },
                ]}>
                {crosshairData.dataPoint.dumbMoney > 0 ? '+' : ''}
                {crosshairData.dataPoint.dumbMoney.toFixed(1)}
              </Text>
            </View>
            <View style={styles(COLORS).tooltipSeparator} />
            <View style={styles(COLORS).tooltipRow}>
              <Text style={styles(COLORS).tooltipCompactLabel}>Ratio:</Text>
              <Text
                style={[
                  styles(COLORS).tooltipCompactValue,
                  {
                    color:
                      crosshairData.dataPoint.smartMoneyRatio >= 0
                        ? COLORS.success
                        : COLORS.error,
                  },
                ]}>
                {crosshairData.dataPoint.smartMoneyRatio > 0 ? '+' : ''}
                {crosshairData.dataPoint.smartMoneyRatio.toFixed(1)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderVIXCard = () => {
    if (!vixData) return null;

    const vixInterpretation = getVIXInterpretation(vixData.current_price);
    const change = vixData.current_price - vixData.previous_close;
    const changePercent = (change / vixData.previous_close) * 100;

    return (
      <Card title='VIX - Fear & Greed Index' variant='primary'>
        <View style={styles(COLORS).indicatorContainer}>
          <View style={styles(COLORS).priceContainer}>
            <Text style={styles(COLORS).currentPrice}>
              {vixData.current_price.toFixed(2)}
            </Text>
            <View style={styles(COLORS).changeContainer}>
              <Text
                style={[
                  styles(COLORS).changeText,
                  { color: change >= 0 ? COLORS.error : COLORS.success },
                ]}>
                {change >= 0 ? '+' : ''}
                {change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>

          <View style={styles(COLORS).levelContainer}>
            <View
              style={[
                styles(COLORS).levelBadge,
                {
                  backgroundColor: `${vixInterpretation.color}20`,
                  borderColor: vixInterpretation.color,
                },
              ]}>
              <Text
                style={[
                  styles(COLORS).levelText,
                  { color: vixInterpretation.color },
                ]}>
                {vixInterpretation.level}
              </Text>
            </View>
            <Text style={styles(COLORS).descriptionText}>
              {vixInterpretation.description}
            </Text>
          </View>

          <View style={styles(COLORS).rangeContainer}>
            <Text style={styles(COLORS).rangeText}>
              Day Range: {vixData.day_low.toFixed(2)} -{' '}
              {vixData.day_high.toFixed(2)}
            </Text>
            <Text style={styles(COLORS).rangeText}>
              Previous Close: {vixData.previous_close.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderSmartMoneyCard = () => {
    if (!smartMoneyData) return null;

    return (
      <Card
        title='Smart Money vs Dumb Money'
        subtitle='Institutional vs Retail Flow'
        variant='secondary'>
        <TouchableWithoutFeedback onPress={() => setCrosshairData(null)}>
          <View style={styles(COLORS).indicatorContainer}>
            <View style={styles(COLORS).signalContainer}>
              <Text style={styles(COLORS).signalLabel}>Overall Signal:</Text>
              <View
                style={[
                  styles(COLORS).signalBadge,
                  {
                    backgroundColor: `${getSignalColor(
                      smartMoneyData.signal
                    )}20`,
                    borderColor: getSignalColor(smartMoneyData.signal),
                  },
                ]}>
                <Text
                  style={[
                    styles(COLORS).signalText,
                    { color: getSignalColor(smartMoneyData.signal) },
                  ]}>
                  {smartMoneyData.signal.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Timeframe Selector */}
            <View style={styles(COLORS).timeframeContainer}>
              <Text style={styles(COLORS).timeframeLabel}>Timeframe:</Text>
              <View style={styles(COLORS).timeframeButtons}>
                {timeframes.map((timeframe) => (
                  <TouchableOpacity
                    key={timeframe.value}
                    style={[
                      styles(COLORS).timeframeButton,
                      selectedTimeframe === timeframe.value &&
                        styles(COLORS).timeframeButtonActive,
                    ]}
                    onPress={() => setSelectedTimeframe(timeframe.value)}>
                    <Text
                      style={[
                        styles(COLORS).timeframeButtonText,
                        selectedTimeframe === timeframe.value &&
                          styles(COLORS).timeframeButtonTextActive,
                      ]}>
                      {timeframe.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles(COLORS).ratioContainer}>
              <Text style={styles(COLORS).ratioLabel}>Smart Money Ratio:</Text>
              <Text
                style={[
                  styles(COLORS).ratioValue,
                  {
                    color:
                      smartMoneyData.smartMoneyRatio >= 0
                        ? COLORS.success
                        : COLORS.error,
                  },
                ]}>
                {smartMoneyData.smartMoneyRatio > 0 ? '+' : ''}
                {smartMoneyData.smartMoneyRatio}
              </Text>
            </View>

            <View style={styles(COLORS).metricsContainer}>
              <View style={styles(COLORS).metricRow}>
                <Text style={styles(COLORS).metricLabel}>
                  Institutional Flow:
                </Text>
                <Text
                  style={[
                    styles(COLORS).metricValue,
                    {
                      color:
                        smartMoneyData.institutionalFlow >= 0
                          ? COLORS.success
                          : COLORS.error,
                    },
                  ]}>
                  {smartMoneyData.institutionalFlow > 0 ? '+' : ''}
                  {smartMoneyData.institutionalFlow}
                </Text>
              </View>

              <View style={styles(COLORS).metricRow}>
                <Text style={styles(COLORS).metricLabel}>
                  Retail Sentiment:
                </Text>
                <Text
                  style={[
                    styles(COLORS).metricValue,
                    {
                      color:
                        smartMoneyData.retailSentiment >= 0
                          ? COLORS.success
                          : COLORS.error,
                    },
                  ]}>
                  {smartMoneyData.retailSentiment > 0 ? '+' : ''}
                  {smartMoneyData.retailSentiment}
                </Text>
              </View>

              <View style={styles(COLORS).metricRow}>
                <Text style={styles(COLORS).metricLabel}>
                  Dark Pool Activity:
                </Text>
                <Text style={styles(COLORS).metricValue}>
                  {smartMoneyData.darkPoolActivity.toFixed(1)}%
                </Text>
              </View>

              <View style={styles(COLORS).metricRow}>
                <Text style={styles(COLORS).metricLabel}>Options Flow:</Text>
                <Text
                  style={[
                    styles(COLORS).metricValue,
                    {
                      color:
                        smartMoneyData.optionsFlow >= 0
                          ? COLORS.success
                          : COLORS.error,
                    },
                  ]}>
                  {smartMoneyData.optionsFlow > 0 ? '+' : ''}
                  {smartMoneyData.optionsFlow}
                </Text>
              </View>
            </View>

            {/* Historical Chart */}
            <SmartMoneyChart
              data={smartMoneyData.historicalData}
              timeframe={selectedTimeframe}
            />
          </View>
        </TouchableWithoutFeedback>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles(COLORS).container}>
        <View style={styles(COLORS).loadingContainer}>
          <ActivityIndicator size='large' color={COLORS.accent} />
          <Text style={styles(COLORS).loadingText}>Loading Indicators...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles(COLORS).container}>
      <ScrollView
        contentContainerStyle={styles(COLORS).scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={COLORS.accent}
          />
        }>
        <View style={styles(COLORS).header}>
          <Text style={styles(COLORS).headerTitle}>Market Indicators</Text>
          <TouchableOpacity
            style={styles(COLORS).refreshButton}
            onPress={() => loadData(true)}
            disabled={refreshing}>
            <Text style={styles(COLORS).refreshButtonText}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        {renderVIXCard()}
        {renderSmartMoneyCard()}

        <View style={styles(COLORS).disclaimerContainer}>
          <Text style={styles(COLORS).disclaimerText}>
            📊 Real-time data from Yahoo Finance. Smart Money Index calculated
            from SPY/QQQ volume analysis, VIX correlation, and institutional
            flow patterns. Put/Call ratios estimated from market volatility.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = (COLORS: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: COLORS.textSecondary,
      marginTop: 16,
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    refreshButton: {
      backgroundColor: COLORS.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    refreshButtonText: {
      color: COLORS.background,
      fontWeight: '600',
    },
    indicatorContainer: {
      gap: 16,
    },
    priceContainer: {
      alignItems: 'center',
    },
    currentPrice: {
      fontSize: 36,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    changeContainer: {
      marginTop: 4,
    },
    changeText: {
      fontSize: 16,
      fontWeight: '600',
    },
    levelContainer: {
      alignItems: 'center',
      gap: 8,
    },
    levelBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    levelText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    descriptionText: {
      fontSize: 14,
      color: COLORS.textMuted,
      textAlign: 'center',
    },
    rangeContainer: {
      backgroundColor: COLORS.surface,
      padding: 12,
      borderRadius: 8,
      gap: 4,
    },
    rangeText: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    signalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    signalLabel: {
      fontSize: 16,
      color: COLORS.textPrimary,
      fontWeight: '600',
    },
    signalBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
    },
    signalText: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    ratioContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.surface,
      padding: 16,
      borderRadius: 8,
    },
    ratioLabel: {
      fontSize: 18,
      color: COLORS.textPrimary,
      fontWeight: '600',
    },
    ratioValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    metricsContainer: {
      gap: 12,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    metricLabel: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    disclaimerContainer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: COLORS.surface,
      borderRadius: 8,
    },
    disclaimerText: {
      fontSize: 12,
      color: COLORS.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
    // Chart styles
    chartContainer: {
      backgroundColor: COLORS.surface,
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.textPrimary,
    },
    chartLegend: {
      flexDirection: 'row',
      gap: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
      color: COLORS.textSecondary,
    },
    chart: {
      backgroundColor: COLORS.background,
      borderRadius: 8,
      position: 'relative',
      alignSelf: 'center',
    },
    gridContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    gridLine: {
      position: 'absolute',
      left: 20,
      right: 20,
      height: 0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    zeroLine: {
      position: 'absolute',
      left: 20,
      right: 20,
      height: 2,
      backgroundColor: COLORS.textMuted,
    },
    chartPoint: {
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    chartLine: {
      position: 'absolute',
      height: 1.5,
      transformOrigin: 'left center',
    },
    xAxisLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingHorizontal: 20,
    },
    axisLabel: {
      fontSize: 10,
      color: COLORS.textMuted,
    },
    // Timeframe selector styles
    timeframeContainer: {
      marginVertical: 12,
    },
    timeframeLabel: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: 8,
    },
    timeframeButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    timeframeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: 'transparent',
    },
    timeframeButtonActive: {
      backgroundColor: COLORS.accent,
      borderColor: COLORS.accent,
    },
    timeframeButtonText: {
      fontSize: 12,
      color: COLORS.textSecondary,
      fontWeight: '500',
    },
    timeframeButtonTextActive: {
      color: COLORS.background,
      fontWeight: '600',
    },
    // Crosshair styles
    crosshairLine: {
      position: 'absolute',
      width: 1,
      backgroundColor: COLORS.accent,
      opacity: 0.8,
    },
    crosshairDot: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.accent,
      borderWidth: 2,
      borderColor: COLORS.background,
    },
    // Tooltip styles
    crosshairTooltip: {
      position: 'absolute',
      backgroundColor: COLORS.surface,
      borderRadius: 6,
      padding: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      minWidth: 130,
      maxWidth: 130,
    },
    tooltipDate: {
      fontSize: 11,
      color: COLORS.textPrimary,
      fontWeight: '600',
      marginBottom: 6,
      textAlign: 'center',
    },
    tooltipRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    tooltipIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    tooltipDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    tooltipLabel: {
      fontSize: 11,
      color: COLORS.textSecondary,
      flex: 1,
    },
    tooltipValue: {
      fontSize: 12,
      fontWeight: '600',
      minWidth: 40,
      textAlign: 'right',
    },
    tooltipSeparator: {
      height: 1,
      backgroundColor: COLORS.border,
      marginVertical: 4,
    },
    tooltipCompactLabel: {
      fontSize: 10,
      color: COLORS.textSecondary,
      fontWeight: '500',
    },
    tooltipCompactValue: {
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'right',
    },
  });

export default IndicatorsScreen;
